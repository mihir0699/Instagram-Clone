import { act } from "react-dom/test-utils";

export default (state, action) => {
    switch (action.type) {
      case "USER_LOADED":
          let isAuth = false;
          if(action.payload)
            isAuth = true
        return {
          ...state,
          isAuthenticated: isAuth,
          loading: false,
          user : action.payload
        };
        case "SIGNUP":
          return {
            ...state,
            isAuthenticated: true,
            loading: false,
            user : action.payload
          };
        case "SET_ERROR":
          return {
            ...state,
            error : action.payload
          }
        case "REMOVE_ERROR":
          return{
            ...state,
            error : null
          }
     
    }
}