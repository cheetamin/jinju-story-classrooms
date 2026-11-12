import concurrent.futures,hashlib,json,os,subprocess,time,uuid,math
from pathlib import Path
BASE=os.environ.get('LANTERN_LOAD_TEST_ORIGIN','')
if BASE!='https://jinju-story-trial-20261102.cheetamin.workers.dev' or os.environ.get('LANTERN_ALLOW_LIVE_TEST')!='30-synthetic-students':
 raise SystemExit('Explicit origin and LANTERN_ALLOW_LIVE_TEST=30-synthetic-students are required; no requests sent.')
ROOT=Path.cwd()/'outputs'/'production-load-test'
ROOT.mkdir(parents=True,exist_ok=True);ROOT.chmod(0o700)
PHOTO=Path(os.environ['LANTERN_LOAD_TEST_PHOTO']).resolve()
if not PHOTO.is_file() or PHOTO.stat().st_size>512*1024:raise SystemExit('Use a synthetic test image at most 512 KiB.')
request_metrics=[]
state={'teacher_password':uuid.uuid4().hex+uuid.uuid4().hex,'code':uuid.uuid4().hex,'label':'자동삭제_성능검증_'+uuid.uuid4().hex[:8]}
jars={};results=[];room=None;failed=None

def req(who,path,data=None,upload=False,expected=200,binary=False):
 headers={'Origin':BASE,'X-Lantern-Request':'1','X-Lantern-Context':'studio','Cookie':'; '.join(k+'='+v for k,v in jars.get(who,{}).items())}
 lines=['url = '+json.dumps(BASE+'/api/'+path),'silent','show-error','max-time = 45','dump-header = -','write-out = "\\n__META__%{http_code} %{time_total}"']
 for k,v in headers.items():lines.append('header = '+json.dumps(k+': '+v))
 if upload:lines+=['form = '+json.dumps('file=@'+str(PHOTO)+';filename=virtual-test.webp;type=image/webp')]
 elif data is not None:lines+=['header = "Content-Type: application/json"','data = '+json.dumps(json.dumps(data,ensure_ascii=True))]
 r=subprocess.run(['curl','--config','-'],input=('\n'.join(lines)+'\n').encode(),capture_output=True)
 if r.returncode:raise RuntimeError('transport failed: '+str(r.returncode))
 payload,_,meta=r.stdout.rpartition(b'\n__META__');status,seconds=meta.decode().split();status=int(status)
 # Proxy CONNECT headers precede the actual response headers.
 while payload.startswith(b'HTTP/'):
  raw,sep,payload=payload.partition(b'\r\n\r\n')
  if not sep:raise RuntimeError('missing headers')
  if raw.startswith(b'HTTP/1.1 200 Connection established') or raw.startswith(b'HTTP/1.1 200 OK') and payload.startswith(b'HTTP/'):continue
  response_headers={}
  for line in raw.decode('latin1').split('\r\n'):
   if ':' in line:
    hk,hv=line.split(':',1);response_headers[hk.lower()]=hv.strip()
   if line.lower().startswith('set-cookie:'):
    pair=line.split(':',1)[1].strip().split(';')[0];k,v=pair.split('=',1);jars.setdefault(who,{})[k]=v
  break
 request_metrics.append({'path':path.split('?')[0],'status':status,'execution':response_headers.get('x-lantern-execution'),'server_timing':response_headers.get('server-timing')})
 if status!=expected:
  try:message=json.loads(payload).get('error','unexpected response')
  except:message='non-JSON response '+payload[:200].decode('utf8','replace')
  raise RuntimeError(path.split('?')[0]+' HTTP '+str(status)+' '+message)
 return (payload if binary else json.loads(payload)),float(seconds)

def phase(name,fn,n=30):
 start=time.monotonic()
 with concurrent.futures.ThreadPoolExecutor(max_workers=n) as pool:values=list(pool.map(fn,range(1,n+1)))
 timing=sorted(v for v in values if isinstance(v,(int,float)))
 row={'phase':name,'clients':n,'success':len(values),'wave_seconds':round(time.monotonic()-start,3)}
 if timing:row.update(p50_seconds=round(timing[len(timing)//2],3),p95_seconds=round(timing[math.ceil(.95*len(timing))-1],3),max_seconds=round(timing[-1],3))
 results.append(row);print(json.dumps(row),flush=True)

try:
 room,_=req('teacher','classrooms/create',{'school':'성능시험용가상초등학교','label':state['label'],'password':state['teacher_password'],'code':state['code'],'students':[{'number':i,'name':'가상학생'+str(i)} for i in range(1,31)]})
 state['room']=room['id'];state['students']=room['students'];f=ROOT/'private-recovery.json';f.write_text(json.dumps(state));f.chmod(0o600)
 suffix='?class='+room['id']
 req('teacher','auth/teacher'+suffix,{'password':state['teacher_password']})
 print('baseline class-entry seconds',req('baseline','auth/class'+suffix,{'code':state['code']})[1],flush=True)
 phase('class-entry',lambda n:req(str(n),'auth/class'+suffix,{'code':state['code']})[1])
 phase('student-entry',lambda n:req(str(n),'auth/student'+suffix,{'id':str(n),'password':room['students'][n-1]['password']})[1])
 def load(n):
  mine,t=req(str(n),'mine'+suffix);assert mine['profile']['id']==str(n);return t
 phase('authenticated-load',load)
 revisions={};files={}
 def upload(n):
  f,t=req(str(n),'upload'+suffix,upload=True);files[n]=f['id'];assert f['size']==PHOTO.stat().st_size;return t
 phase('photo-upload-180KB',upload)
 def save(n):
  mine,_=req(str(n),'mine'+suffix);out,t=req(str(n),'work'+suffix,{'revision':mine['revision'],'work':{'title':'가상학생 '+str(n)+' 저장검증','body':'실서버 동시 저장·사진 연결 확인을 위한 가상 자료입니다.','files':[files[n]]}});revisions[n]=out['revision'];return t
 phase('save-photo-work',save)
 def verify(n):
  mine,t=req(str(n),'mine'+suffix);assert mine['draft']['files']==[files[n]];assert mine['draft']['title']=='가상학생 '+str(n)+' 저장검증';return t
 phase('saved-content-verification',verify)
 expected=hashlib.sha256(PHOTO.read_bytes()).digest()
 def image(n):
  b,t=req(str(n),'files/'+files[n]+suffix,binary=True);assert hashlib.sha256(b).digest()==expected;return t
 phase('photo-download-integrity',image)
 print('PASS 30 real production clients: unique auth, upload, saved image linkage and byte integrity',flush=True)
except Exception as e:
 failed=str(e);print('FAIL '+failed,flush=True)
finally:
 if room:
  try:
   backup,_=req('teacher','teacher/backup?class='+room['id']);p=ROOT/'virtual-class-backup.json';p.write_text(json.dumps(backup));p.chmod(0o600)
   deleted,_=req('teacher','teacher/delete-class?class='+room['id'],{'password':state['teacher_password'],'confirmation':state['label'],'backupConfirmed':True})
   assert deleted.get('ok');print('CLEANUP test class and '+str(deleted.get('deletedFiles'))+' test photos removed',flush=True);state['cleaned']=True
  except Exception as e:print('CLEANUP_PENDING '+str(e),flush=True);state['cleaned']=False
  (ROOT/'private-recovery.json').write_text(json.dumps(state));(ROOT/'private-recovery.json').chmod(0o600)
 (ROOT/'production-results.json').write_text(json.dumps({'photo_bytes':PHOTO.stat().st_size,'phases':results,'error':failed,'cleaned':state.get('cleaned',True),'request_metrics':request_metrics},indent=2))
 if failed or not state.get('cleaned',True):raise SystemExit(1)
