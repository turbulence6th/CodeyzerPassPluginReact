import { Divider } from 'primereact/divider';
import DisariyaAktar from './DisariyaAktar';
import IceriyeAktar from './IceriyeAktar';

const Aktar = () => {

    return (
        <div className="card flex justify-content-evenly">
            <div>
                <IceriyeAktar/>
            </div>
            <Divider layout='vertical'/>
            <div className='flex flex-column gap-3'>
                <DisariyaAktar/>
            </div>
        </div>
    );
};

export default Aktar;