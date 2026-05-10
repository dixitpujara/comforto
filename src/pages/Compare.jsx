import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import '../assets/css/Compare.css';

const Compare = () => {
  const { compareList, toggleCompare, clearCompare } = useCompare();

  return (
    <div className="container main-content animate-fade-in compare-page">
      <div className="compare-header">
        <div>
          <h1>Compare Products</h1>
          <p>{compareList.length} / 4 items selected</p>
        </div>
        {compareList.length > 0 && (
          <button className="btn btn-outline" onClick={clearCompare}>
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>

      {compareList.length > 0 ? (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <tbody>
              <tr>
                <th>Product</th>
                {compareList.map(product => (
                  <td key={`img-${product.id}`} className="compare-cell-product">
                    <button className="remove-compare-btn" onClick={() => toggleCompare(product)} title="Remove">×</button>
                    <img src={product.image} alt={product.name} />
                    <h4><Link to={`/product/${product.id}`}>{product.name}</Link></h4>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Category</th>
                {compareList.map(product => (
                  <td key={`cat-${product.id}`}>{product.category}</td>
                ))}
              </tr>
              <tr>
                <th>Description</th>
                {compareList.map(product => (
                  <td key={`desc-${product.id}`}>{product.description}</td>
                ))}
              </tr>
              <tr>
                <th>Features</th>
                {compareList.map(product => (
                  <td key={`feat-${product.id}`}>
                    <ul className="compare-features">
                      {product.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No products to compare</h3>
          <p>Add products to compare their features side by side.</p>
          <Link to="/catalog" className="btn btn-primary mt-4">Go to Catalog</Link>
        </div>
      )}
    </div>
  );
};

export default Compare;
