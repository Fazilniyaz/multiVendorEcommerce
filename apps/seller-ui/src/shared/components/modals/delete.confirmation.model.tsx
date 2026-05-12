import React from 'react'
import { X } from 'lucide-react'

export const DeleteConfirmationModel = ({ product, onClose, onConfirm, onRestore} : any) => {
  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
      <div className='bg-gray-900 p-6 rounded-lg w-[450px] shadow-lg'>
        <div className='flex justify-between items-center pb-3 border-gray-700 border-b'>
          <h3 className='text-xl font-bold text-white'>Delete Product</h3>
          <button onClick={onClose} className='text-gray-400 hover:text-white'>
            <X size={22} />
          </button>
        </div>
        <p className='text-gray-400 mb-6'>
          Are you sure you want to delete this product?
          <span className='font-semibold'> {product.title}</span>
          <br />
          This product will be moved to a **deleted state** and permanently removed **after 24 hours**. You can recover it within this time.
        </p>
        <div className='flex justify-end gap-4 mt-6'>
          <button
            onClick={onClose}
            className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg'
          >
            Cancel
          </button>
          <button
            onClick={!product?.isDeleted ? onConfirm : onRestore}
            className={`${product?.isDeleted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg`}
          >
            {!product?.isDeleted ? 'Delete' : 'Restore'}
          </button>
        </div>
      </div>
    </div>
  )
}
