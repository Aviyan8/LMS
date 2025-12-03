export default function errorHandler(err, req, res, next) {
  console.error(err);
  
  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ 
      error: err.errors.map(e => e.message).join(", ") 
    });
  }
  
  // Handle Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ 
      error: "Resource already exists" 
    });
  }
  
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error" 
  });
}

