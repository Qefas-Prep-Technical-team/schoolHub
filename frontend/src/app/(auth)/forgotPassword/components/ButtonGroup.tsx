import Button from "./Button";


export default function ButtonGroup() {
  return (
    <div className="flex flex-col gap-3">
      <Button text="Send Reset Link" variant="primary" />
      <Button text="Back to Login" variant="ghost" />
    </div>
  );
}
