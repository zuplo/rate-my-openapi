import "./style.css";

export const FullScreenLoading = () => {
  return (
    <div
      className="loading-background"
      style={{
        background: "#FFFFFF",
      }}
    >
      <div className="loading-bar">
        <div
          className="loading-circle-1"
          style={{
            background: "#3bbf5e",
          }}
        />
        <div
          className="loading-circle-2"
          style={{
            background: "#3bbf5e",
          }}
        />
      </div>
    </div>
  );
};

export default FullScreenLoading;
