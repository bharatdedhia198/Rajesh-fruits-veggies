// Shared localStorage helpers for users and orders

export const getUsers = () => {
  try { return JSON.parse(localStorage.getItem("rjUsers")) || []; }
  catch { return []; }
};

export const saveUsers = (users) => localStorage.setItem("rjUsers", JSON.stringify(users));

export const getOrders = () => {
  try { return JSON.parse(localStorage.getItem("rjOrders")) || []; }
  catch { return []; }
};

export const saveOrders = (orders) => localStorage.setItem("rjOrders", JSON.stringify(orders));

export const registerUser = (name, email, phone, password) => {
  const users = getUsers();
  const exists = users.find(u => u.email === email || u.phone === phone);
  if (exists) return exists;
  const user = { id: Date.now(), name, email, phone, password, joinedAt: new Date().toISOString() };
  saveUsers([...users, user]);
  return user;
};

export const deleteCustomer = (userId) => {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;
  saveUsers(getUsers().filter(u => u.id !== userId));
  saveOrders(getOrders().filter(o => o.customer?.email !== user.email));
};

// Use phone as primary key, email as fallback — whichever is non-empty
const addrKey = (email, phone) => {
  const key = (phone && phone.trim()) ? phone.trim() : (email && email.trim()) ? email.trim() : null;
  if (!key) return null;
  return `rjAddr_${key}`;
};

export const getSavedAddresses = (email, phone) => {
  const key = addrKey(email, phone);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

export const addOrUpdateAddress = (email, phone, address, index = null) => {
  const key = addrKey(email, phone);
  if (!key) return;
  const list = getSavedAddresses(email, phone);
  if (index !== null) list[index] = address;
  else list.push(address);
  localStorage.setItem(key, JSON.stringify(list));
};

export const saveOrder = (order) => {
  const orders = getOrders();
  saveOrders([...orders, { ...order, id: Date.now(), placedAt: new Date().toISOString(), status: "open" }]);
};

export const updateOrderStatus = (orderId, status) => {
  saveOrders(getOrders().map(o => o.id === orderId ? { ...o, status } : o));
};

export const getOrdersByEmail = (email) =>
  getOrders().filter(o => o.customer?.email === email);
