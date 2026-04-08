# 📱 How to Build Your Android App (Step-by-Step)

Follow these simple steps to get your app ready for the Google Play Store!

### Step 1: Your App URL
Your live website is `https://educatemw.vercel.app`. 
- In GitHub Secrets, set **`NEXT_PUBLIC_API_BASE_URL`** to `https://educatemw.vercel.app`.
- This tells the Android app where to find your database and payment systems.

---

### Step 2: Get your Firebase File (`google-services.json`)
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click the **Settings icon (⚙️)** next to "Project Overview" and choose **Project settings**.
3. Scroll down to "Your apps" and click **Add app**, then click the **Android icon**.
4. **Android package name**: Enter `com.educatemw.app`.
5. Click **Register app**.
6. Click **Download google-services.json**.
7. **Important**: Upload this file to your project inside the folder: `android/app/google-services.json`. (You can drag and drop it into the file explorer here in AI Studio).

---

### Step 3: Create your "Digital Signature" (Keystore)
Every Android app needs a "signature" so Google knows it's really from you.

**If you are using Termux on your phone:**
1. Open Termux and run these commands one by one:
   ```bash
   pkg update && pkg upgrade
   pkg install openjdk-17
   ```
2. Now run this command to create the key (replace `MY_PASSWORD` with a password you will remember):
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias -storepass MY_PASSWORD -keypass MY_PASSWORD
   ```
3. This creates a file called `my-release-key.jks` in your Termux folder.

**If you are using a Computer:**
1. Open your terminal/command prompt.
2. Run the same `keytool` command above.

---

### Step 4: Turn your Key into Text (Base64)
GitHub can't "see" files easily, so we turn the key into a long string of text.

**On Termux or Mac/Linux:**
1. Run:
   ```bash
   base64 my-release-key.jks
   ```
2. A giant block of text will appear. **Long-press and copy all of it.** This is your **`ANDROID_KEYSTORE_BASE64`**.

**On Windows (PowerShell):**
1. Run:
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.jks"))
   ```
2. Copy the output.

---

### Step 5: Put it all in GitHub
1. Go to your repository on GitHub.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** for each of these:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://educatemw.vercel.app`
   - `ANDROID_KEYSTORE_BASE64`: (The giant text from Step 4)
   - `ANDROID_KEYSTORE_PASSWORD`: (The password you chose in Step 3)
   - `ANDROID_KEY_ALIAS`: `my-key-alias`
   - `ANDROID_KEY_PASSWORD`: (The same password from Step 3)

---

### Step 6: Build!
Once you save those secrets and push your code to GitHub, click the **Actions** tab at the top of your GitHub page. You will see a workflow called "Build Android APK" running. When it finishes, you can download your app!
