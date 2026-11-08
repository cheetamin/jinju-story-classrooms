import type {Metadata} from 'next';
import './globals.css';
import {RegionProvider} from '../components/lantern/RegionContext';
export const metadata:Metadata={title:'우리 지역 이야기',description:'우리 지역의 이야기가 동물 유등으로 반짝이는 전시관',robots:{index:false,follow:false},icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><RegionProvider>{children}</RegionProvider></body></html>}
