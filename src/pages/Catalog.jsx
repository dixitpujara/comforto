import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import ProductCard from '../components/ProductCard';
import '../assets/css/Catalog.css';

const ITEMS_PER_PAGE = 12;

// Defined OUTSIDE the page so the inputs don't lose focus on each keystroke.
const FilterGroup = ({ title, items, state, onToggle, open, onToggleOpen }) => (
  <div className={`filter-group ${open ? 'is-open' : 'is-closed'}`}>
    <button type="button" className="filter-group-head" onClick={onToggleOpen} aria-expanded={open}>
      <span>{title}</span>
      {open ? <Minus size={14} /> : <Plus size={14} />}
    </button>
    {open && (
      <div className="checkbox-list">
        {items.length === 0 ? (
          <p className="filter-empty">No options match</p>
        ) : items.map(({ value, count }) => (
          <label key={value} className="checkbox-row">
            <input
              type="checkbox"
              checked={state.includes(value)}
              onChange={() => onToggle(value)}
            />
            <span className="checkbox-label">{value}</span>
            <span className="checkbox-count">({count})</span>
          </label>
        ))}
      </div>
    )}
  </div>
);

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const { products, categories, materials, roomTypes, availabilities, subcategories } = useProducts();

  const [selectedCategories,    setSelectedCategories]    = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedMaterials,     setSelectedMaterials]     = useState([]);
  const [selectedRooms,         setSelectedRooms]         = useState([]);
  const [selectedAvail,         setSelectedAvail]         = useState([]);
  const [searchQuery,           setSearchQuery]           = useState('');
  const [visibleCount,          setVisibleCount]          = useState(ITEMS_PER_PAGE);

  // Accordion: only one group open at a time. null = all closed.
  const [openGroup, setOpenGroup] = useState('Category');
  const toggleGroup = (key) => setOpenGroup(prev => (prev === key ? null : key));
  const openGroups = {
    Search:       openGroup === 'Search',
    Category:     openGroup === 'Category',
    Subcategory:  openGroup === 'Subcategory',
    Material:     openGroup === 'Material',
    Room:         openGroup === 'Room',
    Availability: openGroup === 'Availability',
  };

  // ---- URL → state sync (fires every time category/subcategory/q in the URL changes) ----
  useEffect(() => {
    const cat = searchParams.get('category');
    const sub = searchParams.get('subcategory');
    const q   = searchParams.get('q');
    setSelectedCategories(cat ? [cat] : []);
    setSelectedSubcategories(sub ? [sub] : []);
    setSearchQuery(q || '');
    if (sub) setOpenGroup('Subcategory');
  }, [searchParams]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategories, selectedSubcategories, selectedMaterials, selectedRooms, selectedAvail, searchQuery]);

  const makeToggle = (state, setState) => (value) => {
    setState(state.includes(value) ? state.filter(x => x !== value) : [...state, value]);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedMaterials([]);
    setSelectedRooms([]);
    setSelectedAvail([]);
    setSearchQuery('');
  };

  // Match helper that lets us "exclude" one filter group when computing counts
  const matchesExcept = (p, except) => {
    const q = searchQuery.trim().toLowerCase();
    const c  = except === 'Category'     || !selectedCategories.length    || selectedCategories.includes(p.category);
    const sc = except === 'Subcategory'  || !selectedSubcategories.length || selectedSubcategories.includes(p.subcategory);
    const m  = except === 'Material'     || !selectedMaterials.length     || selectedMaterials.includes(p.material);
    const r  = except === 'Room'         || !selectedRooms.length         || selectedRooms.includes(p.roomType);
    const a  = except === 'Availability' || !selectedAvail.length         || selectedAvail.includes(p.availability);
    const s = !q
      || p.name.toLowerCase().includes(q)
      || (p.subtitle || '').toLowerCase().includes(q)
      || (p.category || '').toLowerCase().includes(q)
      || (p.subcategory || '').toLowerCase().includes(q);
    return c && sc && m && r && a && s;
  };

  const filtered = useMemo(() => products.filter(p => matchesExcept(p, null)),
    [products, selectedCategories, selectedSubcategories, selectedMaterials, selectedRooms, selectedAvail, searchQuery]);

  // Build option lists with counts; hide options whose count is 0
  const optionsWithCount = (groupName, opts, field) =>
    opts
      .filter(o => o !== 'All')
      .map(value => ({
        value,
        count: products.filter(p => p[field] === value && matchesExcept(p, groupName)).length
      }))
      .filter(x => x.count > 0);

  // Subcategories shown depend on the selected categories (all of them when none
  // is selected). Names are de-duped across categories.
  const subcategoryOptions = useMemo(() => {
    const cats = selectedCategories.length ? selectedCategories : Object.keys(subcategories);
    const seen = [];
    cats.forEach(c => (subcategories[c] || []).forEach(s => { if (!seen.includes(s)) seen.push(s); }));
    return seen;
  }, [subcategories, selectedCategories]);

  const categoryItems     = useMemo(() => optionsWithCount('Category',     categories,     'category'),     [products, categories,     selectedSubcategories, selectedMaterials, selectedRooms, selectedAvail, searchQuery]);
  const subcategoryItems  = useMemo(() => optionsWithCount('Subcategory',  subcategoryOptions, 'subcategory'), [products, subcategoryOptions, selectedCategories, selectedMaterials, selectedRooms, selectedAvail, searchQuery]);
  const materialItems     = useMemo(() => optionsWithCount('Material',     materials,      'material'),     [products, materials,      selectedCategories, selectedSubcategories, selectedRooms, selectedAvail, searchQuery]);
  const roomItems         = useMemo(() => optionsWithCount('Room',         roomTypes,      'roomType'),     [products, roomTypes,      selectedCategories, selectedSubcategories, selectedMaterials, selectedAvail, searchQuery]);
  const availabilityItems = useMemo(() => optionsWithCount('Availability', availabilities, 'availability'), [products, availabilities, selectedCategories, selectedSubcategories, selectedMaterials, selectedRooms, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const hasFilters =
    selectedCategories.length || selectedSubcategories.length || selectedMaterials.length ||
    selectedRooms.length || selectedAvail.length || searchQuery;

  return (
    <div className="catalog container animate-fade-in">
      <div className="catalog-head">
        <span className="eyebrow">The Collection</span>
        <h1 className="section-title">Our Collection</h1>
        <p>Discover premium, hand-finished furniture for the modern home.</p>
      </div>

      <div className="catalog-grid">
        <aside className="catalog-filters">
          <div className="filters-head">
            <h2>Filters</h2>
            {hasFilters ? <button className="link-btn" onClick={clearAll}>Clear all</button> : null}
          </div>

          <div className={`filter-group ${openGroups.Search ? 'is-open' : 'is-closed'}`}>
            <button type="button" className="filter-group-head" onClick={() => toggleGroup('Search')} aria-expanded={openGroups.Search}>
              <span>Search</span>
              {openGroups.Search ? <Minus size={14} /> : <Plus size={14} />}
            </button>
            {openGroups.Search && (
              <input
                type="search"
                placeholder="Search pieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          <FilterGroup title="Category"     items={categoryItems}     state={selectedCategories} onToggle={makeToggle(selectedCategories, setSelectedCategories)} open={openGroups.Category}     onToggleOpen={() => toggleGroup('Category')} />
          {subcategoryItems.length > 0 && (
            <FilterGroup title="Subcategory" items={subcategoryItems} state={selectedSubcategories} onToggle={makeToggle(selectedSubcategories, setSelectedSubcategories)} open={openGroups.Subcategory} onToggleOpen={() => toggleGroup('Subcategory')} />
          )}
          <FilterGroup title="Material"     items={materialItems}     state={selectedMaterials}  onToggle={makeToggle(selectedMaterials,  setSelectedMaterials)}  open={openGroups.Material}     onToggleOpen={() => toggleGroup('Material')} />
          <FilterGroup title="Room"         items={roomItems}         state={selectedRooms}      onToggle={makeToggle(selectedRooms,      setSelectedRooms)}      open={openGroups.Room}         onToggleOpen={() => toggleGroup('Room')} />
          <FilterGroup title="Availability" items={availabilityItems} state={selectedAvail}      onToggle={makeToggle(selectedAvail,      setSelectedAvail)}      open={openGroups.Availability} onToggleOpen={() => toggleGroup('Availability')} />
        </aside>

        <main className="catalog-main">
          <div className="catalog-meta">
            <span>{filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}</span>
            {searchQuery && <span>for "{searchQuery}"</span>}
          </div>

          {visible.length > 0 ? (
            <div className="catalog-products">
              {visible.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No pieces found</h3>
              <p>Try adjusting your filters to see more options.</p>
              {hasFilters && <button className="btn btn-primary" onClick={clearAll}>Clear filters</button>}
            </div>
          )}

          {hasMore && (
            <div className="load-more">
              <button className="btn btn-ghost" onClick={() => setVisibleCount(v => v + ITEMS_PER_PAGE)}>
                Load more
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
