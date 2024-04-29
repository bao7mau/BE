const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
async function initialize() {
    try {
      await oracledb.createPool({
        user: dbConfig.user,
        password: dbConfig.password,
        connectString: dbConfig.connectString
      });
      console.log('Connection pool created successfully.');
    } catch (err) {
      console.error('Error creating connection pool:', err);
    }
  }
  
  initialize()
async function checkLogin(username, password) {
    let connection;
    try {
        // Kết nối vào Oracle
        connection = await oracledb.getConnection(dbConfig);
        
        // Thực hiện truy vấn SELECT trên bảng người dùng, kiểm tra tên người dùng và mật khẩu
        const result = await connection.execute('SELECT * FROM users WHERE USERNAME = :username AND PASSWORD = :password', [username, password]);
        
        return result.rows;
    } catch (err) {
        // Nếu có lỗi, ném ra lỗi để xử lý ở phần gọi hàm
        throw err;
    } finally {
        // Đóng kết nối
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Lỗi khi đóng kết nối:', err);
            }
        }
    }
}

// Hàm để lấy thông tin người dùng từ username
async function getUserInfoByUsername(username) {
    let connection;
    try {
        // Kết nối vào Oracle
        connection = await oracledb.getConnection(dbConfig);
        
        // Thực hiện truy vấn SELECT trên bảng người dùng dựa trên tên người dùng
        const result = await connection.execute('SELECT * FROM users WHERE USERNAME = :username', [username]);
        
        // Trả về thông tin người dùng
        return result.rows[0]; // Chú ý: Đây là một mảng, lấy phần tử đầu tiên nếu có
    } finally {
        // Đóng kết nối
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Lỗi khi đóng kết nối:', err);
            }
        }
    }
}
async function registerUser(username, password, role = 'USER') {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
      
        // Thực hiện truy vấn để kiểm tra xem tên người dùng đã tồn tại chưa
        const result = await connection.execute('SELECT COUNT(*) AS count FROM users WHERE USERNAME= :username', [username]);
        if (result.rows[0].COUNT > 0) {
            throw new Error('Tên người dùng đã tồn tại.');
        }
      
     
          // Thực hiện truy vấn để chèn người dùng mới vào cơ sở dữ liệu với vai trò mặc định là 'user'
          const currentDate = new Date(); // Lấy thời gian hiện tại
          await connection.execute('INSERT INTO USERS (USERNAME, PASSWORD, ROLE, DATE_REGISTERED) VALUES (:username, :password, :role, :dateRegistered)', 
                                   { username, password, role, dateRegistered: currentDate });
        
        // Commit transaction
        await connection.commit();
      
        // Giải phóng kết nối
        await connection.close();
      
        return { message: 'Tài khoản đã được tạo thành công.' };
    } catch (error) {
        console.error('Lỗi khi đăng ký tài khoản:', error);
        throw error;
    }
}

module.exports = { checkLogin, getUserInfoByUsername, registerUser};
