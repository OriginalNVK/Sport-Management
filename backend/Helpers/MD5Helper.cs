using System.Security.Cryptography;
using System.Text;

namespace backend.Helpers;

/// <summary>
/// Helper class để hash password sử dụng MD5
/// </summary>
public static class MD5Helper
{
    /// <summary>
    /// Hash password sử dụng thuật toán MD5
    /// </summary>
    /// <param name="password">Password cần hash</param>
    /// <returns>Password đã được hash dưới dạng string hex</returns>
    public static string HashPassword(string password)
    {
        using (MD5 md5 = MD5.Create())
        {
            byte[] inputBytes = Encoding.UTF8.GetBytes(password);
            byte[] hashBytes = md5.ComputeHash(inputBytes);

            // Convert byte array sang hex string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("x2"));
            }
            return sb.ToString();
        }
    }

    /// <summary>
    /// Verify password với hash
    /// </summary>
    /// <param name="password">Password cần verify</param>
    /// <param name="hash">Hash đã lưu trong database</param>
    /// <returns>True nếu password khớp, False nếu không</returns>
    public static bool VerifyPassword(string password, string hash)
    {
        string hashOfInput = HashPassword(password);
        return StringComparer.OrdinalIgnoreCase.Compare(hashOfInput, hash) == 0;
    }
}
