export const getSellerURL = () => {
  return process.env.ITEMKU_URL + 'tokoku/saldo';
};

export const getContactURL = () => {
  return process.env.ITEMKU_URL + 'hubungi-kami';
};

export const getResourceURL = () => {
  return process.env.ITEMKU_FILES_URL;
};

export const getBaseURL = () => {
  return process.env.ITEMKU_URL;
};

export const getSubscribeURL = () => {
  return process.env.ITEMKU_URL + 'profil/notifikasi';
};

export const getWithdrawURL = (withdrawId: number) => {
  return process.env.ITEMKU_URL + 'dompetku/pencairan-dana/detil/' + withdrawId;
};
