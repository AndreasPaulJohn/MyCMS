// middleware/roleCheck.js
const isAdmin = (req, res, next) => {
  console.log('User in isAdmin middleware:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};
  
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  };
};


  
  module.exports = { isAdmin, roleCheck };