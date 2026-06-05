'use client';

import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Multi-Purpose Tool Kit',
    category: 'Tools',
    price: 349,
    description: 'Compact household tool kit for quick repairs, assembly and everyday DIY jobs.',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80',
    sizes: ['Standard'],
    colors: ['Black', 'Red'],
    stock: 25
  },
  {
    id: 'p2',
    name: 'Kitchen Storage Set',
    category: 'Household',
    price: 199,
    description: 'Airtight storage containers for dry goods, leftovers and pantry organisation.',
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=900&q=80',
    sizes: ['Small', 'Medium', 'Large'],
    colors: ['Clear', 'Grey'],
    stock: 40
  },
  {
    id: 'p3',
    name: 'Everyday Travel Backpack',
    category: 'Accessories',
    price: 429,
    description: 'Durable everyday backpack with multiple compartments for work, school or travel.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    sizes: ['One Size'],
    colors: ['Black', 'Navy', 'Olive'],
    stock: 18
  }
];

const ADMIN_PASSWORD = 'ChangeMe123!';
const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

export default function Storefront() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipping, setShipping] = useState(99);
  const [view, setView] = useState('shop');
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setProducts(readStorage('products', DEFAULT_PRODUCTS));
    setCart(readStorage('cart', []));
    setOrders(readStorage('orders', []));
    setShipping(readStorage('shipping', 99));
  }, []);

  useEffect(() => writeStorage('products', products), [products]);
  useEffect(() => writeStorage('cart', cart), [cart]);
  useEffect(() => writeStorage('orders', orders), [orders]);
  useEffect(() => writeStorage('shipping', shipping), [shipping]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = cart.length ? subtotal + Number(shipping || 0) : 0;

  function addToCart(product, options) {
    const key = `${product.id}-${options.size}-${options.color}`;
    setCart(current => {
      const existing = current.find(item => item.key === key);
      if (existing) return current.map(item => item.key === key ? { ...item, quantity: item.quantity + options.quantity } : item);
      return [...current, { key, productId: product.id, name: product.name, image: product.image, price: Number(product.price), ...options }];
    });
  }

  function updateQuantity(key, quantity) {
    if (quantity <= 0) setCart(current => current.filter(item => item.key !== key));
    else setCart(current => current.map(item => item.key === key ? { ...item, quantity } : item));
  }

  function placeOrder(customer) {
    const order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('en-ZA'),
      status: 'New order',
      customer,
      items: cart,
      subtotal,
      shipping: Number(shipping || 0),
      total
    };
    setOrders(current => [order, ...current]);
    setCart([]);
    setView('success');
  }

  function saveProduct(product) {
    if (product.id) setProducts(current => current.map(p => p.id === product.id ? product : p));
    else setProducts(current => [{ ...product, id: `p-${Date.now()}` }, ...current]);
  }

  function deleteProduct(id) {
    setProducts(current => current.filter(p => p.id !== id));
  }

  return (
    <main>
      <Header cartCount={cart.reduce((s, i) => s + i.quantity, 0)} setView={setView} adminAuthed={adminAuthed} />

      {view === 'shop' && (
        <>
          <section className="hero">
            <div>
              <p className="eyebrow">Everyday essentials, delivered</p>
              <h1>Your online store for household items, tools and accessories.</h1>
              <p>Browse products, choose size and colour, add to cart and checkout with fixed shipping.</p>
              <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>Shop products</button>
            </div>
            <div className="hero-card">
              <strong>Store features</strong>
              <span>Admin product uploads</span>
              <span>Cart and checkout</span>
              <span>Order dashboard</span>
              <span>Invoice generation</span>
            </div>
          </section>
          <section id="products" className="section">
            <div className="section-title">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2>Shop products</h2>
              </div>
              <div className="tabs">{categories.map(cat => <button className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)} key={cat}>{cat}</button>)}</div>
            </div>
            <div className="grid">
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
            </div>
          </section>
        </>
      )}

      {view === 'cart' && <Cart cart={cart} subtotal={subtotal} shipping={shipping} total={total} updateQuantity={updateQuantity} setView={setView} />}
      {view === 'checkout' && <Checkout cart={cart} subtotal={subtotal} shipping={shipping} total={total} placeOrder={placeOrder} setView={setView} />}
      {view === 'success' && <Success setView={setView} />}
      {view === 'admin' && <Admin adminAuthed={adminAuthed} setAdminAuthed={setAdminAuthed} products={products} saveProduct={saveProduct} deleteProduct={deleteProduct} orders={orders} setOrders={setOrders} shipping={shipping} setShipping={setShipping} />}
    </main>
  );
}

function Header({ cartCount, setView, adminAuthed }) {
  return <header><button className="brand" onClick={() => setView('shop')}>Everyday Goods</button><nav><button onClick={() => setView('shop')}>Shop</button><button onClick={() => setView('cart')}>Cart ({cartCount})</button><button onClick={() => setView('admin')}>{adminAuthed ? 'Admin dashboard' : 'Admin'}</button></nav></header>;
}

function ProductCard({ product, onAdd }) {
  const [size, setSize] = useState(product.sizes?.[0] || 'One Size');
  const [color, setColor] = useState(product.colors?.[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  return <article className="card"><img src={product.image} alt={product.name} /><div className="card-body"><p className="category">{product.category}</p><h3>{product.name}</h3><p>{product.description}</p><strong>{currency.format(product.price)}</strong><label>Size<select value={size} onChange={e => setSize(e.target.value)}>{(product.sizes || ['One Size']).map(s => <option key={s}>{s}</option>)}</select></label><label>Colour<select value={color} onChange={e => setColor(e.target.value)}>{(product.colors || ['Default']).map(c => <option key={c}>{c}</option>)}</select></label><label>Quantity<input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></label><button onClick={() => onAdd(product, { size, color, quantity })}>Add to cart</button></div></article>;
}

function Cart({ cart, subtotal, shipping, total, updateQuantity, setView }) {
  return <section className="section narrow"><h2>Your cart</h2>{!cart.length ? <p>Your cart is empty.</p> : <><div className="list">{cart.map(item => <div className="line" key={item.key}><img src={item.image} alt="" /><div><strong>{item.name}</strong><p>{item.size} / {item.color}</p><p>{currency.format(item.price)} each</p></div><input type="number" min="0" value={item.quantity} onChange={e => updateQuantity(item.key, Number(e.target.value))} /></div>)}</div><Totals subtotal={subtotal} shipping={shipping} total={total} /><button onClick={() => setView('checkout')}>Checkout</button></>}</section>;
}

function Checkout({ cart, subtotal, shipping, total, placeOrder, setView }) {
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', phone: '', address: '', paymentMethod: 'Online payment placeholder' });
  function submit(e) { e.preventDefault(); if (!cart.length) return; placeOrder(customer); }
  return <section className="section narrow"><h2>Checkout</h2><form onSubmit={submit} className="form"><input required placeholder="Name" value={customer.firstName} onChange={e => setCustomer({ ...customer, firstName: e.target.value })} /><input required placeholder="Surname" value={customer.lastName} onChange={e => setCustomer({ ...customer, lastName: e.target.value })} /><input required placeholder="Cellphone number" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} /><textarea required placeholder="Shipping address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} /><select value={customer.paymentMethod} onChange={e => setCustomer({ ...customer, paymentMethod: e.target.value })}><option>Online payment placeholder</option><option>Cash/EFT on confirmation</option></select><Totals subtotal={subtotal} shipping={shipping} total={total} /><button>Complete order</button><button type="button" className="secondary" onClick={() => setView('cart')}>Back to cart</button></form></section>;
}

function Success({ setView }) { return <section className="section narrow success"><h2>Order placed</h2><p>Your order has been recorded. The store owner can view it in the admin dashboard.</p><button onClick={() => setView('shop')}>Continue shopping</button></section>; }
function Totals({ subtotal, shipping, total }) { return <div className="totals"><span>Subtotal <b>{currency.format(subtotal)}</b></span><span>Shipping <b>{currency.format(Number(shipping || 0))}</b></span><span className="grand">Total <b>{currency.format(total)}</b></span></div>; }

function Admin({ adminAuthed, setAdminAuthed, products, saveProduct, deleteProduct, orders, setOrders, shipping, setShipping }) {
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(null);
  if (!adminAuthed) return <section className="section narrow"><h2>Admin login</h2><p>Default password: <b>ChangeMe123!</b>. Change this before going live.</p><form className="form" onSubmit={e => { e.preventDefault(); if (password === ADMIN_PASSWORD) setAdminAuthed(true); }}><input type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)} /><button>Login</button></form></section>;
  return <section className="section admin"><div className="section-title"><div><p className="eyebrow">Private dashboard</p><h2>Admin controls</h2></div><button className="secondary" onClick={() => setEditing({})}>Add product</button></div><div className="admin-grid"><div className="panel"><h3>Shipping cost</h3><input type="number" value={shipping} onChange={e => setShipping(Number(e.target.value))} /><p>This fixed shipping rate is added at checkout.</p></div><div className="panel"><h3>Order notifications</h3><p>{orders.filter(o => o.status === 'New order').length} new order(s)</p></div></div>{editing && <ProductEditor product={editing} saveProduct={(p) => { saveProduct(p); setEditing(null); }} cancel={() => setEditing(null)} />}<h3>Products</h3><div className="table">{products.map(p => <div className="row" key={p.id}><span>{p.name}</span><span>{currency.format(p.price)}</span><button onClick={() => setEditing(p)}>Edit</button><button className="danger" onClick={() => deleteProduct(p.id)}>Delete</button></div>)}</div><h3>Orders</h3><div className="orders">{orders.map(order => <OrderCard key={order.id} order={order} setOrders={setOrders} />)}</div></section>;
}

function ProductEditor({ product, saveProduct, cancel }) {
  const [form, setForm] = useState({ id: product.id, name: product.name || '', category: product.category || '', price: product.price || 0, description: product.description || '', image: product.image || '', sizes: (product.sizes || ['One Size']).join(', '), colors: (product.colors || ['Default']).join(', '), stock: product.stock || 0 });
  function submit(e) { e.preventDefault(); saveProduct({ ...form, price: Number(form.price), stock: Number(form.stock), sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean), colors: form.colors.split(',').map(s => s.trim()).filter(Boolean) }); }
  return <form className="form editor" onSubmit={submit}><h3>{form.id ? 'Edit product' : 'Add product'}</h3><input required placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /><input required placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /><input required type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /><input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /><textarea required placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /><input placeholder="Sizes, comma separated" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} /><input placeholder="Colours, comma separated" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} /><input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /><button>Save product</button><button type="button" className="secondary" onClick={cancel}>Cancel</button></form>;
}

function OrderCard({ order, setOrders }) {
  function invoice() {
    const html = `<html><head><title>Invoice ${order.id}</title><style>body{font-family:Arial;padding:30px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #ddd;padding:10px;text-align:left}</style></head><body><h1>Invoice</h1><p><b>Order:</b> ${order.id}</p><p><b>Date:</b> ${order.date}</p><p><b>Customer:</b> ${order.customer.firstName} ${order.customer.lastName}</p><p><b>Phone:</b> ${order.customer.phone}</p><p><b>Address:</b> ${order.customer.address}</p><table><tr><th>Item</th><th>Options</th><th>Qty</th><th>Total</th></tr>${order.items.map(i => `<tr><td>${i.name}</td><td>${i.size} / ${i.color}</td><td>${i.quantity}</td><td>${currency.format(i.price * i.quantity)}</td></tr>`).join('')}</table><h3>Subtotal: ${currency.format(order.subtotal)}</h3><h3>Shipping: ${currency.format(order.shipping)}</h3><h2>Total: ${currency.format(order.total)}</h2><script>window.print()</script></body></html>`;
    const win = window.open('', '_blank'); win.document.write(html); win.document.close();
  }
  function markPacked() { setOrders(current => current.map(o => o.id === order.id ? { ...o, status: 'Packed / shipped' } : o)); }
  return <article className="order"><div><strong>{order.id}</strong><span>{order.status}</span></div><p>{order.customer.firstName} {order.customer.lastName} · {order.customer.phone}</p><p>{order.customer.address}</p><ul>{order.items.map(item => <li key={item.key}>{item.quantity} x {item.name} ({item.size}, {item.color})</li>)}</ul><strong>{currency.format(order.total)}</strong><div className="actions"><button onClick={invoice}>Generate invoice</button><button className="secondary" onClick={markPacked}>Mark packed/shipped</button></div></article>;
}
