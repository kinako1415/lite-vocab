"use client";
import { CreateUser } from "@/lib/auth";
import { useState } from "react";
import Button from "@/components/elements/Button";
import Input from "@/components/elements/Input";
import Image from "next/image";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div
      style={{
        backgroundColor: "#7750D3",
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          CreateUser({ email, password });
        }}
        style={{
          borderRadius: "20px",
          height: "fit-content",
          width: "fit-content",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: "100",
          padding: "54px 48px",
          backgroundColor: "#ffffff",
          gap: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            alignItems: "center",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "500", color: "#7750D3" }}
          >
            😎 サインインをしよう！！
          </div>
          <div
            style={{ fontSize: "12px", fontWeight: "400", color: "#7750D3" }}
          >
            🚀 今すぐログインして、ワクワクする体験を始めよう！！
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "400px",
            }}
          >
            <Input
              url="https://api.iconify.design/tabler:mail.svg?color=%23A4A5B5"
              placeholder="メールアドレスを入力！！"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            <Input
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
              placeholder="秘密のパスワードを入力してね！！"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              isPassword={true}
            />
            <Input
              url="https://api.iconify.design/tabler:eye.svg?color=%23A4A5B5"
              placeholder="秘密のパスワードをもう一度入力しよう！！"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              isPassword={true}
            />
          </div>
          <Button type="submit">Sign Up</Button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                height: "2px",
                width: "188px",
                backgroundColor: "#EAEBFD",
              }}
            ></div>
            <div style={{ color: "#A4A5B5", fontWeight: "700" }}>OR</div>
            <div
              style={{
                height: "2px",
                width: "188px",
                backgroundColor: "#EAEBFD",
              }}
            ></div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
            }}
          >
            <Button type="submit" color="gray">
              <Image
                src="https://api.iconify.design/devicon:google.svg?color=%23293641"
                alt="google"
                width={28}
                height={28}
              />
            </Button>
            <Button type="submit" color="gray">
              <Image
                src="https://api.iconify.design/akar-icons:github-fill.svg?color=%23293641"
                alt="google"
                width={30}
                height={30}
              />
            </Button>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#A4A5B5",
            }}
          >
            まだアカウント登録してない？ ここで
            <span style={{ fontWeight: "500", color: "#0A0C1A" }}>Sign up</span>
            !!
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
