"use client";
import { message, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/ReactToastify.css";

interface Specification {
  specification: string;
  specificationDescription: string;
}

interface Variant {
  value: string;
  price: number;
}

interface ProductVariants {
  [variant: string]: Variant[];
}

const SellerAddProductContainer = ({
  setAddProductVisibility,
  clickedProduct,
  updatedProducts,
}: any) => {
  const [imageArray, setImageArray] = useState<string[]>([]);
  const [imageFileArray, setImageFileArray] = useState<File[]>([]);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [productQty, setProductQty] = useState(0);
  const [productDescription, setProductDescription] = useState("");
  const [specification, setSpesification] = useState("");
  const [specificationDescription, setSpecificationDescription] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [variant, setVariant] = useState<string>("");
  const [variantInput, setVariantInput] = useState("");
  const [variantValue, setvariantValue] = useState("");
  const [variantPrice, setvariantPrice] = useState("");
  const [VariantsList, setVariantsList] = useState<string[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariants>({});
  const [errors, setErrors] = useState({
    productName: false,
    productCategory: false,
    productPrice: false,
    productQty: false,
    productDescription: false,
    images: false,
    specifications: false,
  });

  useEffect(() => {
    if (clickedProduct) {
      setProductName(clickedProduct.title || "");
      setProductCategory(clickedProduct.category || "");
      setProductPrice(clickedProduct.price || 0);
      setProductQty(clickedProduct.qty || 0);
      setProductDescription(clickedProduct.description || "");

      setImageArray(
        clickedProduct.images?.map((img: any) => img.imageUrl) || []
      );
      setSpecifications(clickedProduct.specifications || []);

      const variants = clickedProduct.variants || {};
      setProductVariants(variants);
      setVariantsList(Object.keys(variants));
    }
  }, [clickedProduct]);

  useEffect(() => {
    const convertImageToFile = async () => {
      if (imageArray.length > 0) {
        const files = [];
        for (const image of imageArray) {
          try {
            const response = await fetch(image);
            const arrayBuffer = await response.arrayBuffer();

            console.log("Array Buffer: ", arrayBuffer);

            const file = new File([arrayBuffer], "image.jpg", {
              type: "image/jpeg",
            });
            files.push(file);
          } catch (error) {
            console.error("Error fetching image:", error);
          }
        }
        setImageFileArray(files);
      }
    };

    if (imageArray.length > 0) {
      convertImageToFile();
    }
  }, [imageArray]);

  const columns = [
    {
      title: "Specification",
      dataIndex: "specification",
      key: "specification",
    },
    {
      title: "Description",
      dataIndex: "specificationDescription",
      key: "specificationDescription",
    },
    {
      title: "Delete",
      render: (record: any) => (
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
    setSpesification("");
    setSpecificationDescription("");
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
      message.error("Please correct the highlighted fields.");
      return;
    }

    //setAddProductVisibility(false);
    const formData = new FormData();
    if (clickedProduct) {
      formData.append("productId", clickedProduct._id);
    }
    formData.append("productName", productName);
    formData.append("productCategory", productCategory);
    formData.append("productPrice", productPrice.toString());
    formData.append("productQty", productQty.toString());
    formData.append("productDescription", productDescription);
    for (const image of imageFileArray) {
      formData.append("images", image);
    }
    formData.append("productSpecifications", JSON.stringify(specifications));
    formData.append("productVariants", JSON.stringify(productVariants));

    const loading = toast.loading("Writing data...");
    const method = clickedProduct ? "PUT" : "POST";
    const res = await fetch("/api/products/controller", {
      method: method,
      body: formData,
    });

    toast.dismiss(loading);
    if (res.ok) {
      setAddProductVisibility(false);
      const response = await res.json();
      if (response.success) {
        updatedProducts(response.content);
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    }
  };

  const addVariantFn = (e: any) => {
    e.preventDefault();
    const variantPresent = VariantsList.some((item) => item === variant);
    if (variantPresent) {
      return message.error("Variant already present");
    }
    setVariantsList((prev: any) => [...prev, variant]);
    message.success("Variant added");
  };

  const addProductVariantFn = (e: any) => {
    e.preventDefault();

    if (!variantInput || !variantValue || !variantPrice) {
      return message.error("Please fill out all fields.");
    }

    const price = parseFloat(variantPrice);
    if (isNaN(price) || price <= 0) {
      return message.error("Please provide a valid price.");
    }

    setProductVariants((prev) => {
      const updatedVariants: ProductVariants = { ...prev };

      if (updatedVariants[variantInput]) {
        const valueExists = updatedVariants[variantInput].some(
          (item: any) => item.value === variantValue
        );

        if (valueExists) {
          return {
            ...updatedVariants,
            [variantInput]: updatedVariants[variantInput].map((item: any) =>
              item.value === variantValue ? { ...item, price } : item
            ),
          };
        } else {
          updatedVariants[variantInput].push({
            value: variantValue,
            price,
          });

          return updatedVariants;
        }
      } else {
        updatedVariants[variantInput] = [{ value: variantValue, price }];
        return updatedVariants;
      }
    });

    message.success("Variant updated successfully!");
  };

  // Flatten the data for Antd table
  const tableData = Object.keys(productVariants)
    .map((variant) => {
      return productVariants[variant].map((item) => ({
        variant,
        value: item.value,
        price: item.price,
      }));
    })
    .flat(); // Flatten to make one list of data

  // Columns configuration for the Antd table
  const columns1 = [
    {
      title: "Variant",
      dataIndex: "variant",
      key: "variant",
      // Merging rows with same variant name
      render: (text: string, record: any, index: number) => {
        // Merging the same variant value
        if (index > 0 && tableData[index - 1].variant === text) {
          return ""; // Return empty string to merge cells
        }
        return text;
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Delete",
      key: "value",
      render: (record:any) => (
        <div className="flex justify-center items-center">
          <AiOutlineDelete
            className="text-red-300 text-xl w-max"
            onClick={() => deleteVariantValue(record)}
          />
        </div>
      ),
    },
  ];

  const deleteVariantValue = (record: any) => {
    console.log(record);
    setProductVariants((prevProductVariants) => {
      const updatedProductVariants = { ...prevProductVariants };

      updatedProductVariants[record.variant] = updatedProductVariants[
        record.variant
      ].filter((item) => item.value !== record.value);

      if (updatedProductVariants[record.variant].length === 0) {
        delete updatedProductVariants[record.variant];
      }

      return updatedProductVariants;
    });
  };

  const deleteImage = (index: number) => {
    setImageArray((prev) => prev.filter((image, i) => i !== index));
    setImageFileArray((prev) => prev.filter((image, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-1/2 h-1/2 bg-white shadow-2xl p-10 rounded-xl border border-pink-300 gap-3 flex flex-col"
    >
      <h1 className="text-black font-semibold text-sm">
        Upload product images -
        <span className="text-gray-500">(*First images is the main image)</span>
      </h1>
      <div className="w-full flex flex-shrink gap-4 items-center overflow-auto">
        {imageArray?.map((item, index) => (
          <div key={index} className="flex">
            <img
              src={item}
              alt=""
              width={100}
              height={100}
              className="object-contain"
            />
            <AiOutlineDelete
              className="text-red-300 text-2xl"
              onClick={() => deleteImage(index)}
            />
          </div>
        ))}
        <input
          type="file"
          id="file_upload"
          multiple
          placeholder="Add images"
          className={`bg-pink-200 rounded-xl font-semibold p-1 h-max w-max hidden`}
          onChange={handleImageInput}
        />
        <label
          htmlFor="file_upload"
          className={`bg-pink-200 border-2 border-pink-300 hover:bg-pink-300 text-sm font-bold text-white rounded-full w-max h-8 flex items-center justify-center p-1 ${
            errors.images ? "border-red-500" : ""
          }`}
        >
          Add Image
        </label>
      </div>

      <h1 className="text-black font-semibold text-sm">
        Fill product details -
        <span className="text-gray-500">
          (*Provide all relevant details to customers)
        </span>
      </h1>
      <div className="flex flex-col gap-3">
        <div className="flex gap-3 w-full justify-between">
          <div className="flex flex-col gap-1 w-full">
            <h1 className="text-black font-semibold text-sm">Product name</h1>
            <input
              value={productName}
              type="text"
              placeholder="Product Name"
              className={`p-2 w-full rounded-xl bg-white shadow-md border shadow-pink-200 ${
                errors.productName ? "border-red-500" : ""
              }`}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <h1 className="text-black font-semibold text-sm">Category</h1>
            <Select
              placeholder="Select a category"
              value={productCategory}
              onChange={(value) => setProductCategory(value)}
              className={`w-full h-10 rounded-xl bg-white shadow-md border shadow-pink-200 ${
                errors.productName ? "border-red-500" : ""
              }`}
            >
              <option value="technology">Technology</option>
              <option value="sports">Sports</option>
              <option value="fashion">Fashion</option>
              <option value="health">Health</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-full">
            <h1 className="text-black font-semibold text-sm">Price</h1>
            <input
              value={productPrice}
              type="number"
              placeholder="Price"
              className={`p-2 w-full rounded-xl bg-white shadow-md border shadow-pink-200 ${
                errors.productPrice ? "border-red-500" : ""
              }`}
              onChange={(e) => setProductPrice(parseInt(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1 w-full">
            <h1 className="text-black font-semibold text-sm">Quantity</h1>
            <input
              value={productQty}
              type="number"
              placeholder="Product QTY"
              className={`p-2 border w-full rounded-xl bg-white shadow-md shadow-pink-200 ${
                errors.productQty ? "border-red-500" : ""
              }`}
              onChange={(e) => setProductQty(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-1">
            <h1 className="text-black font-semibold text-sm">Description</h1>
            <input
              value={productDescription}
              type="text"
              placeholder="Product Description"
              className={`p-2 border w-full h-max min-h-20 rounded-xl bg-white shadow-md shadow-pink-200 ${
                errors.productDescription ? "border-red-500" : ""
              }`}
              onChange={(e) => setProductDescription(e.target.value)}
            />
          </div>
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
            className="text-2xl p-2 bg-pink-300 w-10 h-10 rounded-xl flex items-center justify-center font-bold hover:shadow-xl hover:shadow-pink-200"
            onClick={addSpecification}
          >
            +
          </button>
        </div>

        <Table
          rowKey="value" // This will use value as the unique identifier for rows
          columns={columns1}
          dataSource={tableData} // Ensure this is an array
          bordered
          pagination={false}
          rowClassName="variant-row"
          // Additional props if needed
        />

        <h1 className="text-black font-semibold text-sm">
          Add Variant -{" "}
          <span className="text-gray-500">(e.g color,size,material)</span>
        </h1>

        <div className="flex gap-3">
          <input
            value={variant}
            type="text"
            placeholder="Variant Name"
            className="p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200"
            onChange={(e) => setVariant(e.target.value)}
          />
          <button
            className="text-2xl p-2 bg-pink-300 w-10 h-10 rounded-xl flex items-center justify-center font-bold hover:shadow-xl hover:shadow-pink-200"
            onClick={addVariantFn}
          >
            +
          </button>
        </div>

        <h1 className="text-black font-semibold text-sm">
          Set Variant Prices -{" "}
          <span className="text-gray-500">
            (*Variants may be of same or different prices)
          </span>
        </h1>
        <div className="flex gap-2">
          <Select
            placeholder="Select a variant"
            style={{ width: 200 }}
            onChange={(value) => setVariantInput(value)}
            className={`w-full h-10 rounded-xl bg-white shadow-md border shadow-pink-200 ${
              errors.productName ? "border-red-500" : ""
            }`}
          >
            {VariantsList.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </Select>

          <input
            value={variantValue}
            type="text"
            placeholder="Variant value"
            className="p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200"
            onChange={(e) => setvariantValue(e.target.value)}
          />

          <input
            value={variantPrice}
            type="number"
            placeholder="Variant Price"
            className="p-2 w-full rounded-xl bg-white shadow-md shadow-pink-200"
            onChange={(e) => setvariantPrice(e.target.value)}
          />
          <button
            className="text-2xl p-2 bg-pink-300 w-10 h-10 rounded-xl flex items-center justify-center font-bold hover:shadow-xl hover:shadow-pink-200"
            onClick={addProductVariantFn}
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
      <ToastContainer />
    </form>
  );
};

export default SellerAddProductContainer;
