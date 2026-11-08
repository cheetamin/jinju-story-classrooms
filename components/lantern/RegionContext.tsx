'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {api} from './shared';
import {chapterKindsForRegion} from '../../lib/lantern/chapters.mjs';
import {regionTitle} from '../../lib/lantern/region.mjs';
const RegionContext=createContext({region:'',revision:0});
export function RegionProvider({children}:{children:React.ReactNode}){
 const [value,setValue]=useState({region:'',revision:0});
 useEffect(()=>{let alive=true;const load=()=>api('status').then(r=>{if(alive)setValue({region:r.classroom?.region||'',revision:r.classroom?.regionRevision||0})}).catch(()=>{});void load();window.addEventListener('region-updated',load);return()=>{alive=false;window.removeEventListener('region-updated',load)}},[]);
 useEffect(()=>{document.title=regionTitle(value.region)},[value.region]);
 return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}
export function useRegion(){const value=useContext(RegionContext);return {...value,title:regionTitle(value.region),name:value.region||'우리 지역',kinds:chapterKindsForRegion(value.region||'우리 지역')}};
