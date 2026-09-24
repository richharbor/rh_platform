import axios from 'axios';
import {create} from 'zustand'



axios.defaults.withCredentials = true;


const baseURL = process.env.NEXT_PUBLIC_Base_URL;

export const useAuthStore = create((set) => ({
    authUser:null,
    error:null,

    signupPhone: async (mobileNumber) =>{
        set({error:null});
        try {
            const response = await axios.post(`${baseURL}/signup/phone`, { mobileNumber });
        } catch (error) {
            console.log("Error in singupPhone"+error.message);
            set({error:error.message});
            throw error;
        }
    },
    verifyOTP: async (data, code, page) =>{
        set({error:null})
        try {
              const response = await axios.post(`${baseURL}/signup/verifyOTP`, { data, code, page })
              console.log(response.data)
              set({authUser: response.data.user})
        
              return response.data.user;
              
            } catch (error) {
                set({error: error.message});
                throw error;
            }
    },
    signupEmail: async (name, email, mobileNumber) =>{
        set({error: null});
        try {
            const response = await axios.post(`${baseURL}/signup/email`, {name, email, mobileNumber})
            console.log(response.data);


        } catch (error) {
            set({error:error.message});

            throw error;
        }
    },
    checkAuth: async()=>{
        try {
            const response = await axios.get(`${baseURL}/check-auth`);

            set({authUser: response.data.user})
        } catch (error) {
            
            console.log(error);
        }
    }
}))