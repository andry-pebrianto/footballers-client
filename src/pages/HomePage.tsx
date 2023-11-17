import { Fragment } from "react";
import io from "socket.io-client";
import { useAtom } from "jotai";
import Swal from "sweetalert2";
import _ from "lodash";
import {
  OnlineStatusLoadingAtom,
  onlineStatusAtom,
  socketConnectionAtom,
  userIdAtom,
  userNameAtom,
  usersOnlineAtom,
} from "../global/GlobalData";
import Navbar from "../components/Navbar";
import Env from "../utils/Env";

const badgeColor = ["primary", "success", "warning", "danger", "info"];

export default function HomePage() {
  const [onlineStatusLoading, setOnlineStatusLoading] = useAtom(
    OnlineStatusLoadingAtom
  );
  const [onlineStatus, setOnlineStatus] = useAtom(onlineStatusAtom);
  const [userId] = useAtom(userIdAtom);
  const [userName, setUserName] = useAtom(userNameAtom);
  const [socketConnection, setSocketConnection] = useAtom(socketConnectionAtom);
  const [usersOnline, setUsersOnline] = useAtom(usersOnlineAtom);

  const goOnline = () => {
    setOnlineStatusLoading(true);
    if (!userName) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please Input Your User Name!",
      });
    } else {
      const socketIO = io(Env.SOCKET_URL, {
        query: {
          userId,
          userName,
        },
      });

      socketIO.on("connect", () => {
        setOnlineStatusLoading(false);
        setSocketConnection(socketIO);
        setOnlineStatus(true);
      });

      socketIO.on("userOnlineUpdate", (response) => {
        setUsersOnline(response.users);
      });
    }
  };

  const goOffline = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be disconnected from server!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Disconnect!",
    }).then((result) => {
      if (result.isConfirmed) {
        socketConnection?.disconnect();
        setSocketConnection(null);
        setOnlineStatus(false);
      }
    });
  };

  return (
    <Fragment>
      <Navbar />

      <div className="container my-3">
        <p className="mb-2">User ID: {userId}</p>
        {userName && <p className="mb-2">User Name: {userName}</p>}
        {socketConnection?.id && (
          <p className="mb-2">Socket ID: {socketConnection.id}</p>
        )}

        {!onlineStatus && (
          <input
            type="text"
            style={{ maxWidth: "450px" }}
            className="form-control mb-2"
            placeholder="Input User Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        )}

        {onlineStatusLoading ? (
          <button className="btn btn-primary" type="button" disabled>
            <span
              className="spinner-grow spinner-grow-sm"
              role="status"
              aria-hidden="true"
            ></span>
            {" "}
            Loading...
          </button>
        ) : (
          <>
            {onlineStatus ? (
              <button className="btn btn-danger" onClick={goOffline}>
                Go Offline
              </button>
            ) : (
              <button className="btn btn-primary" onClick={goOnline}>
                Go Online
              </button>
            )}
          </>
        )}

        {onlineStatus && (
          <>
            <h5 className="mt-4">User Online:</h5>
            <div className="d-flex">
              {usersOnline.map((user) => (
                <span
                  key={user.userId}
                  className={`badge text-bg-${
                    badgeColor[_.random(1, 5) - 1]
                  } me-1 p-2`}
                >
                  {user.userName}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </Fragment>
  );
}
