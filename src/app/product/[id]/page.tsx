"use client";

import Image from "next/image";
import { groq } from "next-sanity";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { client } from "../../../../sanity/lib/client";

type Product = {
  _id: string;
  title: string;
  price: number;
  imageUrl: string;
  originalPrice?: number;
  isNew?: boolean;
  isSale?: boolean;
  description?: string;
  discount?: { percentage: number; code: string };
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const productId = params.id;

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [showCartMessage, setShowCartMessage] = useState(false);
  const [showWishlistMessage, setShowWishlistMessage] = useState(false);

  // Fetch product data and discount data
  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      const query = groq`*[_type == "products" && _id == $id][0] {
        _id,
        title,
        price,
        "imageUrl": image.asset->url,
        originalPrice,
        isNew,
        isSale,
        description,
        "discount": *[_type == "discounts" && $id in applicableProducts[]->_id][0] {
          percentage,
          code
        }
      }`;

      try {
        const fetchedProduct = await client.fetch(query, { id: productId });
        setProduct(fetchedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
    setCurrentUrl(window.location.href); // Dynamically set the current URL
  }, [productId]);

  // Add to cart and wishlist
  const handleAddToCart = (): void => {
    if (product) {
      addToCart({ ...product, quantity: 1 });
      setShowCartMessage(true);
      setTimeout(() => setShowCartMessage(false), 3000); // Hide after 3 seconds
    }
  };

  const handleAddToWishlist = (): void => {
    if (product) {
      addToWishlist(product);
      setShowWishlistMessage(true);
      setTimeout(() => setShowWishlistMessage(false), 3000); // Hide after 3 seconds
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700 text-xl font-medium">Product not found</p>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.price - (product.price * product.discount.percentage) / 100
    : product.price;

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      {/* Success Messages */}
      {showCartMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-in">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <p className="font-semibold">{product.title}</p>
            <p className="text-sm">Added to cart!</p>
          </div>
        </div>
      )}

      {showWishlistMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-slide-in">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <p className="font-semibold">{product.title}</p>
            <p className="text-sm">Added to wishlist!</p>
          </div>
        </div>
      )}

      {/* Product Details */}
      <div className="flex max-w-4xl w-full">
        {/* Image Section */}
        <div className="w-1/2 p-4">
          <Image
            src={product.imageUrl}
            alt={product.title}
            width={300}
            height={500}
            className="rounded-lg"
          />
        </div>

        {/* Product Details Section */}
        <div className="w-1/2 p-4">
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="mt-4 mb-4 text-xl font-semibold text-green-600">
            ${finalPrice.toFixed(2)}
          </p>
          {product.originalPrice && (
            <p className="text-sm text-gray-500 line-through mt-2">
              Original Price: ${product.originalPrice}
            </p>
          )}
          {product.discount && (
            <p className="text-sm text-red-500 font-medium mt-2">
              Discount: {product.discount.percentage}% off (Code:{" "}
              {product.discount.code})
            </p>
          )}
          <p className="text-gray-700 mt-4">{product.description}</p>

          {/* Add To Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-[#007580] text-white font-semibold py-2 px-4 rounded"
          >
            Add To Cart
          </button>

          {/* Add To Wishlist Button */}
          <button
            onClick={handleAddToWishlist}
            className="mt-4 bg-[#007580] text-white font-semibold py-2 px-4 rounded ml-4"
          >
            Add To Wishlist
          </button>

          {/* Product Tags */}
          {product.isNew && (
            <span className="text-sm text-green-600 font-medium mt-2 block">
              New Arrival
            </span>
          )}
          {product.isSale && (
            <span className="block text-sm text-red-600 font-medium mt-2">
              On Sale!
            </span>
          )}
        </div>
      </div>

      {/* Social Media Share Section */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold mb-4">
          Share this product with your friends on social media:
        </p>
        <div className="flex justify-center gap-4">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=Check out this product`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-600"
          >
            Twitter
          </a>
          <a
            href={`https://wa.me/?text=Check%20out%20this%20product:%20${product.title}%20at%20${currentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
