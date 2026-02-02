# Security Checklist สำหรับ Smart Home Dashboard

## ก่อน Deploy

### Firebase Security
- [ ] ตรวจสอบ Firebase Realtime Database Rules
- [ ] ตรวจสอบ Firebase Authentication settings
- [ ] ตรวจสอบ authorized_users list
- [ ] เปิด Email enumeration protection (Firebase Console → Authentication → Settings)

### Environment Variables
- [ ] ตรวจสอบว่า `.env` ไม่ถูก commit ขึ้น Git
- [ ] ตั้งค่า Environment Variables บน hosting platform
- [ ] ลบ API keys ที่ไม่ใช้แล้ว

### Code Security
- [ ] ไม่มี `console.log()` ที่แสดงข้อมูลสำคัญ
- [ ] ไม่มี hardcoded credentials
- [ ] ไม่มี `dangerouslySetInnerHTML` หรือใช้อย่างปลอดภัย
- [ ] Protected routes ทำงานถูกต้อง

### Headers & Configuration
- [ ] Security headers ครบถ้วน (X-Frame-Options, CSP, etc.)
- [ ] HTTPS เท่านั้น (ไม่มี HTTP)
- [ ] CORS settings ถูกต้อง

## หลัง Deploy

### Testing with OWASP ZAP
- [ ] Run Automated Scan
- [ ] Manual Explore + Active Scan
- [ ] ตรวจสอบ Alerts ทั้งหมด
- [ ] แก้ไข High/Medium severity issues

### Manual Testing
- [ ] ทดสอบ Login/Logout
- [ ] ทดสอบ Authorization (user ที่ไม่ได้รับอนุญาต)
- [ ] ทดสอบ Protected routes
- [ ] ทดสอบ Guest access

### Online Scanners
- [ ] Mozilla Observatory: https://observatory.mozilla.org/
- [ ] Security Headers: https://securityheaders.com/
- [ ] SSL Labs: https://www.ssllabs.com/ssltest/

## Firebase Realtime Database Rules ที่แนะนำ

```json
{
  "rules": {
    "smart_home": {
      ".read": "auth != null",
      "authorized_users": {
        ".read": "auth != null",
        ".write": false,
        "$uid": {
          ".read": "auth != null && auth.uid == $uid"
        }
      },
      "sensors": {
        ".read": "auth != null && root.child('smart_home/authorized_users/' + auth.uid).val() === true",
        ".write": false
      },
      "devices": {
        ".read": "auth != null && root.child('smart_home/authorized_users/' + auth.uid).val() === true",
        ".write": "auth != null && root.child('smart_home/authorized_users/' + auth.uid).val() === true"
      }
    }
  }
}
```

## ช่องโหว่ที่มักพบและวิธีแก้

### 1. Missing Security Headers
✅ แก้แล้ว: เพิ่มใน firebase.json, netlify.toml, vercel.json

### 2. Weak Firebase Rules
⚠️ ต้องตรวจสอบ: ใน Firebase Console

### 3. API Keys Exposed
✅ แก้แล้ว: ใช้ environment variables

### 4. No Rate Limiting
⚠️ ข้อจำกัด: Firebase มี built-in rate limiting

### 5. XSS Vulnerabilities
✅ ปลอดภัย: React มี built-in XSS protection

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Firebase Security: https://firebase.google.com/docs/rules
- React Security: https://react.dev/learn/security
