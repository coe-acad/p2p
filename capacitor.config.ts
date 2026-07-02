import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.charzpe.p2p",
  appName: "SVMC Charzpe",
  webDir: "dist",
  android: {
    // Capacitor's default WebView user agent contains "wv", which Razorpay
    // (and other payment SDKs) treat as "this is a WebView, hide UPI". We
    // override with a current Chrome Android UA so checkout sees a normal
    // browser and surfaces the UPI section. The Firebase phone-auth plugin
    // doesn't read this UA (it uses native APIs), and our BPP backend only
    // checks the Bearer token, so this change is scoped to what the page
    // JavaScript sees about its host.
    overrideUserAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.103 Mobile Safari/537.36",
  },
  plugins: {
    FirebaseAuthentication: {
      // Phone auth is the only provider we use today. Listing it here loads
      // only the PhoneAuthProvider on Android/iOS instead of every Firebase
      // auth provider, and the plugin requires the explicit opt-in.
      providers: ["phone"],
      // Plugin does NOT call signInWithCredential natively — it just runs the
      // PhoneAuthProvider flow (Play Integrity attestation, SMS send/verify)
      // and hands us the verified verificationId. We then sign into the
      // Firebase JS SDK ourselves with signInWithCredential, which is the
      // only auth instance our app actually reads from. Without this, native
      // sign-in completes silently but auth.currentUser stays null → every
      // backend call fails for lack of a token.
      skipNativeAuth: true,
    },
  },
};

export default config;
