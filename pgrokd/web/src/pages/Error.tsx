import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <h1>天!</h1>
      <p>出错了.</p>
      <p>
        <i>{isRouteErrorResponse(error) ? error.statusText : "Unknown error message"}</i>
      </p>
    </div>
  );
}
