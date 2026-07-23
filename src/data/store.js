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

export const registerUser = (name, email, phone) => {
  const users = getUsers();
  const exists = users.find(u => u.email === email || u.phone === phone);
  if (exists) return exists;
  const user = { id: Date.now(), name, email, phone, joinedAt: new Date().toISOString() };
  saveUsers([...users, user]);
  return user;
};

export const deleteCustomer = (userId) => {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;
  saveUsers(getUsers().filter(u => u.id !== userId));
  saveOrders(getOrders().filter(o => o.customer?.email !== user.email));
};

export const saveOrder = (order) => {
  const orders = getOrders();
  saveOrders([...orders, { ...order, id: Date.now(), placedAt: new Date().toISOString() }]);
};
