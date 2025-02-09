import Wave from "react-wavify";

export const WaveBackground = () => {
  return (
    <div className="fixed -bottom-2 left-0 right-0 z-0">
      <Wave
        fill="#4285f4"
        paused={false}
        options={{
          height: 20,
          amplitude: 20,
          speed: 0.15,
          points: 3,
        }}
      />
    </div>
  );
};
