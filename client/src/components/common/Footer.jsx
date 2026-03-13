export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 40,
        padding: "14px 10px",
        textAlign: "center",
        fontSize: 13,
        color: "#777",
        borderTop: "1px solid #eee",
      }}
    >
      © {new Date().getFullYear()}{" "}
      <span style={{ fontWeight: 600 }}>Healthy Bites</span>.  
      Designed & Developed by{" "}
      <span style={{ fontWeight: 700 }}>priti Nandkumar Bedre</span>.
    </footer>
  );
}
