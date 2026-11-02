import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'우리 고장 진주 이야기',description:'우리의 이야기가 남강 위에 반짝이는 밤',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
