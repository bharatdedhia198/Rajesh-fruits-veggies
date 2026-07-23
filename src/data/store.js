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

export const getSavedAddresses = (email) => {
  try { return JSON.parse(localStorage.getItem("rjAddresses")) || {}; }
  catch { return {}; }
};

export const saveAddress = (email, address) => {
  const all = getSavedAddresses();
  all[email] = address;
  localStorage.setItem("rjAddresses", JSON.stringify(all));
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
