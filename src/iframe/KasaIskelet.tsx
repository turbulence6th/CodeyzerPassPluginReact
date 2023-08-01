import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Skeleton } from "primereact/skeleton";

const KasaIskelet = () => {

    const items = [{}, {}, {}, {}, {}, {}, {}, {}, {}];

    const bodyTemplate = (width: string) => {
        return <Skeleton height="2.95rem" width={width}></Skeleton>
    }

    return (
        <DataTable 
            value={items} 
            className="p-datatable-striped" 
            tableStyle={{ minWidth: '50rem' }}
            header={
                <div className="flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        { bodyTemplate('14.3rem') }
                    </span>
                </div>
            }
        >
            <Column field="code" header="Platform" body={bodyTemplate('17.2em')}></Column>
            <Column field="name" header="Android" body={bodyTemplate('17.2rem')}></Column>
            <Column field="category" header="Kullanıcı Adı" body={bodyTemplate('17.2rem')}></Column>
            <Column field="quantity" header="Şifre" body={bodyTemplate('17.2rem')}></Column>
            <Column field="quantity" header="" body={bodyTemplate('9.5rem')}></Column>
        </DataTable>
    );
};

export default KasaIskelet;