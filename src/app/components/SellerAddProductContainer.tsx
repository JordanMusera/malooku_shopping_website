'use client'
import { Table } from 'antd';
import React, { useState } from 'react'
import { AiOutlineDelete } from 'react-icons/ai';

interface Specification {
    specification: string;
    specificationDescription: string;
}

const SellerAddProductContainer = ({setAddProductVisibility}:any) => {
    const [images, setimages] = useState([1, 2, 3, 4]);
    const [imageArray, setImageArray] = useState<string[]>([]);
    const [imageFileArray, setImageFileArray] = useState<File[]>([]);
    const [productName, setProductName] = useState('');
    const [productCategory,setProductCategory] = useState('');
    const [productPrice,setProductPrice] = useState(0);
    const [productQty,setProductQty] = useState(0);
    const [productDescription,setProductDescription] = useState('');
    const [specification,setSpesification] = useState('');
    const [specificationDescription,setSpecificationDescription] = useState('');
    const [specifications, setSpecifications] = useState<Specification[]>([]);

    const columns = [
        {
            title: 'specification',
            dataIndex:'specification',
            key:'specification'
        },
        {
            title: 'description',
            dataIndex:'specificationDescription',
            key:'specificationDescription'
        },
        {
            title:'Delete',
            render:(record)=>(
                <div>
                    <AiOutlineDelete className='text-red-300 text-xl'
                    onClick={()=>deleteSpec(record)}/>
                </div>
            )
        }
    ]

    const deleteSpec=(record:any)=>{
        const newSpecs = specifications.filter((item)=>item.specification!==record.specification);
        setSpecifications(newSpecs);
    }

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files: File[] = Array.from(e.target.files || []);
        for (const file of files) {
            setImageFileArray((prev) => [...prev, file]);
            const newImage = URL.createObjectURL(file);
            setImageArray((prevArray) => [...prevArray, newImage]);
        }
    };

    const addSpecification=(e:any)=>{
        console.log("Spec: "+specification);
        console.log("Spec Des: "+specificationDescription);
        e.preventDefault();
        setSpecifications((prev) => [
            ...prev,
            {
                specification:specification,
                specificationDescription:specificationDescription,
            },
        ]);
    }

    const handleFormSubmit=async(e:any)=>{
        e.preventDefault();
        setAddProductVisibility(false);
        const formData = new FormData();
        formData.append('productName',productName);
        formData.append('productCategory',productCategory);
        formData.append('productPrice',productPrice.toString());
        formData.append('productQty',productQty.toString());
        formData.append('productDescription',productDescription);
        for(const image of imageFileArray){
            formData.append('images',image);
        }

        const res = await fetch('/api/products/controller',{
            method:'POST',
            body:formData
        });

        const response = await res.json();
        console.log(response);

    }
   

return (
    <form onSubmit={handleFormSubmit} className='w-1/2 h-1/2 bg-white shadow-2xl p-10 rounded-xl border border-pink-300 gap-3 flex flex-col'>
        <div className='w-full flex gap-4 items-center overflow-auto'>
            {imageArray?.map((item, index) => (
                <div key={index}>
                    <img src={item} alt="" width={60} height={60} className='object-contain' />
                </div>
            ))}
            <input
                type='file'
                id='file_upload'
                multiple
                required
                placeholder='Add images'
                className='bg-pink-200 rounded-xl font-semibold p-1 h-max w-max hidden'
                onChange={handleImageInput} />
            <label htmlFor="file_upload" className='bg-pink-200 border border-pink-300 hover:bg-pink-300 text-sm font-bold text-white rounded-full w-max h-8 flex items-center justify-center p-1'>Add Image</label>
        </div>

        <div className='flex flex-col gap-3'>
            <div className='flex gap-3'>
                <input value={productName} type='text' placeholder='Product Name' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200' 
                onChange={e=>setProductName(e.target.value)}/>

                <input value={productCategory} type='text' placeholder='Category' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setProductCategory(e.target.value)}/>
            </div>

            <div className='flex gap-3'>
                <input value={productPrice} type='number' placeholder='Price' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setProductPrice(parseInt(e.target.value))}/>

                <input value={productQty} type='number' placeholder='Product QTY' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setProductQty(parseInt(e.target.value))}/>
            </div>

            <div>
                <input value={productDescription} type='text' placeholder='Product Description' className='p-2 w-full h-max min-h-20 rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setProductDescription(e.target.value)}/>
            </div>

            <Table columns={columns} dataSource={specifications} />

            <div className='flex gap-3'>
                <input value={specification} type='text' placeholder='Specification' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setSpesification(e.target.value)}/>

                <input value={specificationDescription} type='text' placeholder='Description' className='p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200'
                onChange={e=>setSpecificationDescription(e.target.value)}/>
                <button className='text-2xl p-2 bg-pink-300 w-10 h-10 rounded-full flex items-center justify-center font-bold hover:shadow-xl hover:shadow-pink-200'
                onClick={addSpecification}>+</button>
            </div>

            <div className='flex gap-3 mt-2 text-black font-semibold text-md'>
                <button className='w-full p-1 border border-pink-300 rounded-md' onClick={()=>setAddProductVisibility(false)}>Cancel</button>
                <button type='submit' className='w-full p-1 bg-pink-200 border border-pink-300 rounded-md'>Save</button>
            </div>
        </div>


    </form>
)
}

export default SellerAddProductContainer
