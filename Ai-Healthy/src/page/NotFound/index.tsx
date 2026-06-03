import { Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      gap: 16,
    }}>
      <h1 style={{ fontSize: 72, margin: 0, color: "#d9d9d9" }}>404</h1>
      <p style={{ fontSize: 16, color: "#999" }}>页面不存在</p>
      <Button type="primary" onClick={() => navigate("/")}>
        返回首页
      </Button>
    </div>
  );
}
