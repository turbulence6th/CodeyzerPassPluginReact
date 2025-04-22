import { useSelector } from "react-redux";
import AnaEkran from "./AnaEkran";
import KimlikDogrulama from "./KimlikDogrulama";
import { RootState } from "..";

const Popup = () => {
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);

    return (
        <div className="p-2 flex flex-column" style={{ minHeight: '580px' }}>
            <div className="flex-grow-1">
                { !kullanici ?  <KimlikDogrulama/> : <AnaEkran/> }
            </div>
            <div className="mt-auto pt-2 pb-2 pl-2 text-xs border-top-1 border-surface-200 flex align-items-center">
                <img src="/images/icon_48.png" alt="CodeyzerPass Logo" style={{ height: '18px', verticalAlign: 'middle', marginRight: '5px' }} />
                <span className="text-gray-500">CodeyzerPass</span>
            </div>
        </div>
    );
};

export default Popup;