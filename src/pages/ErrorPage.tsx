const ErrorPage = ({ message = "" }) => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Oops! Something went wrong</h1>
      <p style={styles.message}>{message || "Please try again later."}</p>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "red",
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "2rem",
  },
  message: {
    fontSize: "1.2rem",
  },
};

export default ErrorPage;
