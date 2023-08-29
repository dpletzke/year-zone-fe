export const Legend = ({
  classOffsetMap,
}: {
  classOffsetMap: Map<number, string>;
}) => {
  const classNames = Array.from(classOffsetMap.values());
  const classOffsets = Array.from(classOffsetMap.keys());

  return (
    <div
      style={{
        display: "flex",
        marginTop: "20px",
        alignItems: "center",
        gap: "5px",
      }}
    >
      Workplace Time Difference:
      {classNames.map((className, index) => (
        <div
          key={index}
          className={className}
          style={{
            textAlign: "center",
            padding: "8px",
            cursor: "pointer",
            border: "1px solid rgba(185, 185, 185, 0.13)",
            minWidth: "15px",
            color: "white",
          }}
        >
          {classOffsets[index]} hours
        </div>
      ))}
    </div>
  );
};
