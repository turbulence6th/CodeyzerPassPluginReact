import { useSelector } from "react-redux";
import AnaEkran from "./AnaEkran";
import OturumAc from "./OturumAc";
import { RootState } from "..";

const Popup = () => {
    const kullanici = useSelector((state: RootState) => state.codeyzerDepoReducer.kullanici);

    return (
        <div style={{padding: '5px'}}>
            { !kullanici ?  <OturumAc/> : <AnaEkran/> }
        </div>
    );
};

export default Popup;