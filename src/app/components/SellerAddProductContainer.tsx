'use client'
import { message, Select, Table } from 'antd';
import React, { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';

interface Specification {
    specification: string;
    specificationDescription: string;
}

const SellerAddProductContainer = ({ setAddProductVisibility }: any) => {
    const [imageArray, setImageArray] = useState<string[]>([]);
    const [imageFileArray, setImageFileArray] = useState<File[]>([]);
    const [productName, setProductName] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productPrice, setProductPrice] = useState(0);
    const [productQty, setProductQty] = useState(0);
    const [productDescription, setProductDescription] = useState('');
    const [specification, setSpesification] = useState('');
    const [specificationDescription, setSpecificationDescription] = useState('');
    const [specifications, setSpecifications] = useState<Specification[]>([]);
    const [errors, setErrors] = useState({
        productName: false,
        productCategory: false,
        productPrice: false,
        productQty: false,
        productDescription: false,
        images: false,
        specifications: false,
    });

    const columns = [
        {
            title: 'Specification',
            dataIndex: 'specification',
            key: 'specification',
        },
        {
            title: 'Description',
            dataIndex: 'specificationDescription',
            key: 'specificationDescription',
        },
        {
            title: 'Delete',
            render: (record) => (
                <div>
                    <AiOutlineDelete
                        className="text-red-300 text-xl"
                        onClick={() => deleteSpec(record)}
                    />
                </div>
            ),
        },
    ];

    const deleteSpec = (record: any) => {
        const newSpecs = specifications.filter(
            (item) => item.specification !== record.specification
        );
        setSpecifications(newSpecs);
    };

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const files: File[] = Array.from(e.target.files || []);
        for (const file of files) {
            setImageFileArray((prev) => [...prev, file]);
            const newImage = URL.createObjectURL(file);
            setImageArray((prevArray) => [...prevArray, newImage]);
        }
    };

    const addSpecification = (e: any) => {
        e.preventDefault();
        setSpecifications((prev) => [
            ...prev,
            {
                specification: specification,
                specificationDescription: specificationDescription,
            },
        ]);
        setSpesification('');
        setSpecificationDescription('');
    };

    const handleFormSubmit = async (e: any) => {
        e.preventDefault();

        const newErrors = {
            productName: !productName.trim(),
            productCategory: !productCategory.trim(),
            productPrice: productPrice <= 0,
            productQty: productQty <= 0,
            productDescription: !productDescription.trim(),
            images: imageFileArray.length === 0,
            specifications: specifications.length === 0,
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some((error) => error)) {
            message.error('Please correct the highlighted fields.');
            return;
        }

        setAddProductVisibility(false);
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productCategory', productCategory);
        formData.append('productPrice', productPrice.toString());
        formData.append('productQty', productQty.toString());
        formData.append('productDescription', productDescription);
        for (const image of imageFileArray) {
            formData.append('images', image);
        }
        formData.append('productSpecifications', JSON.stringify(specifications));

        const res = await fetch('/api/products/controller', {
            method: 'POST',
            body: formData,
        });

        const response = await res.json();
        console.log(response);
    };

    return (
        <form
            onSubmit={handleFormSubmit}
            className="w-1/2 h-1/2 bg-white shadow-2xl p-10 rounded-xl border border-pink-300 gap-3 flex flex-col"
        >
            <p className="text-md font-semibold text-black">Upload Product Images</p>
            <div className="w-full flex gap-4 items-center overflow-auto">
                {imageArray?.map((item, index) => (
                    <div key={index}>
                        <img src={item} alt="" width={100} height={100} className="object-contain" />
                    </div>
                ))}
                <input
                    type="file"
                    id="file_upload"
                    multiple
                    required
                    placeholder="Add images"
                    className={`bg-pink-200 rounded-xl font-semibold p-1 h-max w-max hidden`}
                    onChange={handleImageInput}
                />
                <label
                    htmlFor="file_upload"
                    className={`bg-pink-200 border-2 border-pink-300 hover:bg-pink-300 text-sm font-bold text-white rounded-full w-max h-8 flex items-center justify-center p-1 ${errors.images ? 'border-red-500' : ''
                        }`}
                >
                    Add Image
                </label>

            </div>

            <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <input
                        value={productName}
                        type="text"
                        placeholder="Product Name"
                        className={`p-2 w-full rounded-xl bg-white shadow-md border shadow-pink-200 ${errors.productName ? 'border-red-500' : ''
                            }`}
                        onChange={(e) => setProductName(e.target.value)}
                    />

                    <Select
                        placeholder="Select a category"
                        style={{ width: 200 }}
                        onChange={(value) => setProductCategory(value)}
                        className={`w-full h-10 rounded-xl bg-white shadow-md border shadow-pink-200 ${errors.productName ? 'border-red-500' : ''
                            }`}
                    >
                        <option value="technology">Technology</option>
                        <option value="sports">Sports</option>
                        <option value="fashion">Fashion</option>
                        <option value="health">Health</option>
                    </Select>
                </div>

                <div className="flex gap-3">
                    <input
                        value={productPrice}
                        type="number"
                        placeholder="Price"
                        className={`p-2 w-full rounded-xl bg-white shadow-md border shadow-pink-200 ${errors.productPrice ? 'border-red-500' : ''
                            }`}
                        onChange={(e) => setProductPrice(parseInt(e.target.value))}
                    />

                    <input
                        value={productQty}
                        type="number"
                        placeholder="Product QTY"
                        className={`p-2 border w-full rounded-xl bg-white shadow-md shadow-pink-200 ${errors.productQty ? 'border-red-500' : ''
                            }`}
                        onChange={(e) => setProductQty(parseInt(e.target.value))}
                    />
                </div>

                <div>
                    <input
                        value={productDescription}
                        type="text"
                        placeholder="Product Description"
                        className={`p-2 border w-full h-max min-h-20 rounded-xl bg-white shadow-md shadow-pink-200 ${errors.productDescription ? 'border-red-500' : ''
                            }`}
                        onChange={(e) => setProductDescription(e.target.value)}
                    />
                </div>

                <Table columns={columns} dataSource={specifications} />

                <div className="flex gap-3">
                    <input
                        value={specification}
                        type="text"
                        placeholder="Specification"
                        className="p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200"
                        onChange={(e) => setSpesification(e.target.value)}
                    />

                    <input
                        value={specificationDescription}
                        type="text"
                        placeholder="Description"
                        className="p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200"
                        onChange={(e) => setSpecificationDescription(e.target.value)}
                    />
                    <button
                        className="text-2xl p-2 bg-pink-300 w-10 h-10 rounded-full flex items-center justify-center font-bold hover:shadow-xl hover:shadow-pink-200"
                        onClick={addSpecification}
                    >
                        +
                    </button>
                </div>

                <div className="flex gap-3 mt-2 text-black font-semibold text-md">
                    <button
                        className="w-full p-1 border border-pink-300 rounded-md hover:shadow-2xl hover:shadow-red-300"
                        onClick={() => setAddProductVisibility(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="w-full p-1 bg-pink-200 border border-pink-300 rounded-md hover:shadow-2xl hover:shadow-green-300"
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    );
};

export default SellerAddProductContainer;
