const LoadingSpinner = ({ strokeColor, fontSize }) => {
  return (
    <>
      <div className="dflex jfycenter">
        <div className="spinner bottomSpinner">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              focusable="false"
            >
              <circle
                cx="14"
                cy="14"
                r="12"
                fill="none"
                stroke={"#3187CD"}
                strokeWidth="4"
                opacity=".15"
              />
              <circle
                pathLength="1"
                cx="14"
                cy="14"
                r="12"
                fill="none"
                stroke={strokeColor}
                strokeWidth="4"
                strokeDasharray="27 57"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </>
  );
};

export default LoadingSpinner;
