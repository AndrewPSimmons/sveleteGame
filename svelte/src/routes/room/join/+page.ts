//Get the 'roomCode' from the URL params and make it available in the component




export function load({ url }: any) {
  return {
    roomCode: url.searchParams.get('roomCode') ?? ""
  };
}