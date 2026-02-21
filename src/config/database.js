import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = 'mongodb+srv://sachinkatiyar08_db_user:sLFPRxMVmUxt1Z33@cluster0.txzempy.mongodb.net/chatdb?retryWrites=true&w=majority&appName=Cluster0';
  try {
    const conn = await mongoose.connect(uri);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
