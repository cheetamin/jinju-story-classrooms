// A fresh unscoped entry screen, even if a different classroom session remains.
export async function completeExhibitionExit(logout,navigate){
 try{await logout()}catch(error){if(![401,410].includes(error?.status))throw error}
 navigate('/?entry=1');
}
