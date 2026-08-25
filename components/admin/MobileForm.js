'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ExternalImage from '@/components/common/ExternalImage';
import { Plus, Trash2, Smartphone, ArrowLeft } from 'lucide-react';
import styles from './MobileForm.module.css';

const COMMON_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Nothing',
  'Vivo',
  'Realme',
  'Motorola',
  'Asus',
];

export default function MobileForm({ initialData = null, isEditing = false }) {
  const router = useRouter();

  // Prepare initial images array
  const initialImages = initialData?.mobile_images
    ? initialData.mobile_images.map((img) => ({
        imageUrl: img.image_url,
        displayOrder: img.display_order,
      }))
    : [{ imageUrl: '', displayOrder: 0 }];

  const [formData, setFormData] = useState({
    brand: initialData?.brand || 'Apple',
    name: initialData?.name || '',
    price: initialData?.price !== undefined ? String(initialData.price) : '',
    original_price: initialData?.original_price !== null && initialData?.original_price !== undefined
      ? String(initialData.original_price)
      : '',
    ram: initialData?.ram || '8GB',
    storage: initialData?.storage || '128GB',
    processor: initialData?.processor || '',
    display: initialData?.display || '',
    camera: initialData?.camera || '',
    battery: initialData?.battery || '',
    description: initialData?.description || '',
    stock_status: initialData?.stock_status || 'in_stock',
    is_featured: initialData?.is_featured || false,
    is_hidden: initialData?.is_hidden || false,
  });

  const [images, setImages] = useState(
    initialImages.length > 0 ? initialImages : [{ imageUrl: '', displayOrder: 0 }]
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = (index, value) => {
    setImages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], imageUrl: value };
      return next;
    });
  };

  const handleAddImageRow = () => {
    if (images.length >= 5) return;
    setImages((prev) => [...prev, { imageUrl: '', displayOrder: prev.length }]);
  };

  const handleRemoveImageRow = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errors = {};

    if (!formData.brand.trim()) errors.brand = 'Brand is required.';
    if (!formData.name.trim()) errors.name = 'Product name is required.';

    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Please enter a valid price (>= 0).';
    }

    if (formData.original_price) {
      const origNum = Number(formData.original_price);
      if (isNaN(origNum) || origNum < 0) {
        errors.original_price = 'Original price must be a valid number.';
      }
    }

    if (!formData.ram.trim()) errors.ram = 'RAM specification is required.';
    if (!formData.storage.trim()) errors.storage = 'Storage specification is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const filteredImages = images
        .filter((img) => img.imageUrl && img.imageUrl.trim().length > 0)
        .map((img, idx) => ({ imageUrl: img.imageUrl.trim(), displayOrder: idx }));

      const payload = {
        ...formData,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : null,
        images: filteredImages,
      };

      const url = isEditing
        ? `/api/admin/mobiles/${initialData.id}`
        : '/api/admin/mobiles';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        router.push('/admin/mobiles');
        router.refresh();
      } else {
        setServerError(data.message || 'Failed to save product.');
        if (data.errors) setFieldErrors(data.errors);
      }
    } catch (err) {
      console.error('Error saving mobile:', err);
      setServerError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {serverError && (
          <div className={styles.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Section 1: General Info */}
          <h2 className={styles.sectionHeader}>1. General Information</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="brand" className={styles.label}>
                Brand *
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                list="brands-list"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Apple"
                className={styles.input}
              />
              <datalist id="brands-list">
                {COMMON_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              {fieldErrors.brand && (
                <span className={styles.errorMessage}>{fieldErrors.brand}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>
                Model Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. iPhone 16 Pro"
                className={styles.input}
              />
              {fieldErrors.name && (
                <span className={styles.errorMessage}>{fieldErrors.name}</span>
              )}
            </div>
          </div>

          {/* Section 2: Pricing & Stock */}
          <h2 className={styles.sectionHeader}>2. Pricing & Stock</h2>

          <div className={`${styles.row} ${styles.rowThree}`}>
            <div className={styles.field}>
              <label htmlFor="price" className={styles.label}>
                Current Price (₹) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="119900"
                className={styles.input}
              />
              {fieldErrors.price && (
                <span className={styles.errorMessage}>{fieldErrors.price}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="original_price" className={styles.label}>
                Original Price (₹) (Optional)
              </label>
              <input
                id="original_price"
                name="original_price"
                type="number"
                min="0"
                step="1"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="129900"
                className={styles.input}
              />
              {fieldErrors.original_price && (
                <span className={styles.errorMessage}>{fieldErrors.original_price}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="stock_status" className={styles.label}>
                Stock Status *
              </label>
              <select
                id="stock_status"
                name="stock_status"
                value={formData.stock_status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="in_stock">In Stock</option>
                <option value="limited_stock">Limited Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>Featured on Homepage</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_hidden"
                checked={formData.is_hidden}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>Hide from Storefront</span>
            </label>
          </div>

          {/* Section 3: Technical Specifications */}
          <h2 className={styles.sectionHeader}>3. Hardware Specifications</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="ram" className={styles.label}>
                RAM *
              </label>
              <input
                id="ram"
                name="ram"
                type="text"
                required
                value={formData.ram}
                onChange={handleChange}
                placeholder="e.g. 8GB"
                className={styles.input}
              />
              {fieldErrors.ram && (
                <span className={styles.errorMessage}>{fieldErrors.ram}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="storage" className={styles.label}>
                Storage *
              </label>
              <input
                id="storage"
                name="storage"
                type="text"
                required
                value={formData.storage}
                onChange={handleChange}
                placeholder="e.g. 256GB"
                className={styles.input}
              />
              {fieldErrors.storage && (
                <span className={styles.errorMessage}>{fieldErrors.storage}</span>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="processor" className={styles.label}>
                Processor / Chipset
              </label>
              <input
                id="processor"
                name="processor"
                type="text"
                value={formData.processor}
                onChange={handleChange}
                placeholder="e.g. A18 Pro Bionic"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="display" className={styles.label}>
                Display
              </label>
              <input
                id="display"
                name="display"
                type="text"
                value={formData.display}
                onChange={handleChange}
                placeholder='e.g. 6.3" Super Retina XDR 120Hz'
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="camera" className={styles.label}>
                Camera System
              </label>
              <input
                id="camera"
                name="camera"
                type="text"
                value={formData.camera}
                onChange={handleChange}
                placeholder="e.g. 48MP Fusion + 48MP Ultra Wide"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="battery" className={styles.label}>
                Battery & Charging
              </label>
              <input
                id="battery"
                name="battery"
                type="text"
                value={formData.battery}
                onChange={handleChange}
                placeholder="e.g. 3582mAh with MagSafe"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of smartphone highlights, design, and capabilities..."
              className={styles.textarea}
            />
          </div>

          {/* Section 4: Image Management */}
          <h2 className={styles.sectionHeader}>4. Product Images (Up to 5)</h2>

          <div className={styles.imageManager}>
            {images.map((img, idx) => (
              <div key={idx} className={styles.imageRow}>
                <div className={styles.imageThumbPreview}>
                  <ExternalImage
                    src={img.imageUrl}
                    alt={`Preview ${idx + 1}`}
                    fill
                    sizes="48px"
                    style={{ objectFit: 'contain' }}
                    fallbackIcon={<Smartphone size={20} color="#cbd5e1" aria-hidden="true" />}
                  />
                </div>

                <input
                  type="url"
                  value={img.imageUrl}
                  onChange={(e) => handleImageChange(idx, e.target.value)}
                  placeholder={idx === 0 ? 'Primary Image URL (e.g. https://...)' : `Image ${idx + 1} URL`}
                  className={`${styles.input} ${styles.imageInput}`}
                />

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageRow(idx)}
                    className={styles.removeImageBtn}
                    title="Remove image"
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <button
                type="button"
                onClick={handleAddImageRow}
                className={styles.addImageBtn}
              >
                <Plus size={16} aria-hidden="true" />
                <span>Add Another Image URL</span>
              </button>
            )}
          </div>

          {/* Form Actions */}
          <div className={styles.actions}>
            <Link href="/admin/mobiles" className="btn btn-outline">
              <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '4px' }} />
              <span>Cancel</span>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '140px', justifyContent: 'center' }}
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Mobile'
                : 'Create Mobile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
