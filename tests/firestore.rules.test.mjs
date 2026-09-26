// Firestore セキュリティルールのテスト
// 実行: npm run test:rules （Firestore エミュレーターが起動し、終わると自動停止）
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const rules = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const DOMAIN = "example.ed.jp";
// ドメインを制限したときの動きも確かめるため、allowedDomains() だけ差し替えたルールを用意する
const DOMAIN_RE = /function allowedDomains\(\)\s*\{\s*return \[[^\]]*\];/;
if (!DOMAIN_RE.test(rules)) throw new Error("firestore.rules に allowedDomains() が見つかりません");
const restrictedRules = rules.replace(DOMAIN_RE, `function allowedDomains() { return ['${DOMAIN}'];`);

let env;
let restrictedEnv;
const token = (email) => ({ email, email_verified: true, firebase: { sign_in_provider: "google.com" } });
const student = (uid, local = uid) => env.authenticatedContext(uid, token(`${local}@${DOMAIN}`)).firestore();
const gmailUser = (e = env) => e.authenticatedContext("eve", token("eve@gmail.com")).firestore();
const passwordUser = () =>
  env.authenticatedContext("mallory", { email: "mallory@gmail.com", email_verified: true, firebase: { sign_in_provider: "password" } }).firestore();
const teacher = () => env.authenticatedContext("t1", token(`sensei@${DOMAIN}`)).firestore();

const progress = (exp = 0) => ({ version: 1, playerName: "たろう", exp, quests: {}, badges: [], titles: ["novice"], skins: ["classic"], equippedTitle: "novice", equippedSkin: "classic", streak: { count: 1, lastDate: "2026-09-26" } });
const userDoc = (uid, extra = {}) => ({
  email: `${uid}@${DOMAIN}`,
  googleName: "山田 太郎",
  profile: { className: "1年A組", studentNumber: 12, nickname: "たろう" },
  progress: progress(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...extra,
});

before(async () => {
  env = await initializeTestEnvironment({ projectId: "craft-quest-test", firestore: { rules } });
  restrictedEnv = await initializeTestEnvironment({ projectId: "craft-quest-test-restricted", firestore: { rules: restrictedRules } });
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "teachers", `sensei@${DOMAIN}`), { name: "先生" });
    await setDoc(doc(ctx.firestore(), "users", "hanako"), { ...userDoc("hanako"), createdAt: new Date(), updatedAt: new Date() });
  });
});
after(async () => {
  await env?.cleanup();
  await restrictedEnv?.cleanup();
});

test("生徒は自分の進捗を作成できる", async () => {
  await assertSucceeds(setDoc(doc(student("taro"), "users", "taro"), userDoc("taro")));
});
test("他人の uid では作成できない", async () => {
  await assertFails(setDoc(doc(student("taro"), "users", "jiro"), userDoc("taro")));
});
test("ドメイン制限なしなら、個人の Google アカウントでも作成できる", async () => {
  await assertSucceeds(setDoc(doc(gmailUser(), "users", "eve"), { ...userDoc("eve"), email: "eve@gmail.com" }));
});
test("Google 以外のログイン方法では作成できない", async () => {
  await assertFails(setDoc(doc(passwordUser(), "users", "mallory"), { ...userDoc("mallory"), email: "mallory@gmail.com" }));
});
test("ドメインを制限すると、ほかのドメインの Google アカウントは作成できない", async () => {
  await restrictedEnv.clearFirestore();
  await assertFails(setDoc(doc(gmailUser(restrictedEnv), "users", "eve"), { ...userDoc("eve"), email: "eve@gmail.com" }));
  const taro = restrictedEnv.authenticatedContext("taro", token(`taro@${DOMAIN}`)).firestore();
  await assertSucceeds(setDoc(doc(taro, "users", "taro"), userDoc("taro")));
});
test("未ログインは読めない", async () => {
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "users", "hanako")));
});
test("生徒は他の生徒の進捗を読めない", async () => {
  await assertFails(getDoc(doc(student("taro"), "users", "hanako")));
});
test("生徒は自分の進捗を更新できる", async () => {
  await assertSucceeds(updateDoc(doc(student("hanako"), "users", "hanako"), { progress: progress(130), updatedAt: serverTimestamp() }));
});
test("EXP をマイナスにはできない", async () => {
  await assertFails(updateDoc(doc(student("hanako"), "users", "hanako"), { progress: progress(-5), updatedAt: serverTimestamp() }));
});
test("余計なフィールドは追加できない", async () => {
  await assertFails(updateDoc(doc(student("hanako"), "users", "hanako"), { isAdmin: true, updatedAt: serverTimestamp() }));
});
test("生徒は自分のデータを削除できない", async () => {
  await assertFails(deleteDoc(doc(student("hanako"), "users", "hanako")));
});
test("先生は全員の進捗を一覧できる", async () => {
  await assertSucceeds(getDocs(collection(teacher(), "users")));
});
test("先生は生徒の進捗を書き換えられない", async () => {
  await assertFails(updateDoc(doc(teacher(), "users", "hanako"), { progress: progress(9999), updatedAt: serverTimestamp() }));
});
test("生徒は一覧を取得できない", async () => {
  await assertFails(getDocs(collection(student("taro"), "users")));
});
test("学習ログは本人が追記できる", async () => {
  await assertSucceeds(addDoc(collection(student("hanako"), "users", "hanako", "events"), { type: "hint", questId: "q01-fence", hintLevel: 1, at: serverTimestamp() }));
});
test("学習ログは書き換えられない", async () => {
  const db = student("hanako");
  let id;
  await env.withSecurityRulesDisabled(async (ctx) => {
    id = (await addDoc(collection(ctx.firestore(), "users", "hanako", "events"), { type: "fail", questId: "q01-fence", at: new Date() })).id;
  });
  await assertFails(updateDoc(doc(db, "users", "hanako", "events", id), { type: "clear" }));
});
test("他人の学習ログは書けない", async () => {
  await assertFails(addDoc(collection(student("taro"), "users", "hanako", "events"), { type: "clear", questId: "q01-fence", at: serverTimestamp() }));
});
test("先生名簿は自分の分だけ確認でき、一覧はできない", async () => {
  await assertSucceeds(getDoc(doc(teacher(), "teachers", `sensei@${DOMAIN}`)));
  await assertFails(getDocs(collection(student("taro"), "teachers")));
  await assertFails(setDoc(doc(student("taro"), "teachers", `taro@${DOMAIN}`), { name: "x" }));
});
