import Button from "./Button";

type setApiProps = {
  validApiKey: boolean,
  setValidApiKey: React.Dispatch<React.SetStateAction<boolean>>,
  handleSaveApiKey: (e: React.FormEvent<HTMLFormElement>) => void,
  setApikey: React.Dispatch<React.SetStateAction<string>>,
}

export default function SetApiComponent(props: setApiProps) {
  const {validApiKey, setValidApiKey, handleSaveApiKey, setApikey} = props;

  return(
    <div>
      { validApiKey ? (
        <div className="flex items-center space-x-2 mt-20 border border-gray-300 py-2 px-4 rounded-md shadow-sm">
          <span className="text-lg text-green-600">有用なAPIキーが設定されています</span>
          <Button 
            text="再度APIキーを設定する"
            variant="default"
            onClick={() => {setValidApiKey(false)}}
          />
        </div>
    ) : (
      <form onSubmit={(e) => handleSaveApiKey(e)} className="flex items-center space-x-2 mt-4">
        <input 
          type="text" 
          placeholder="YOUR_API_KEY" 
          onChange={(e) => setApikey(e.target.value)} 
          className="px-4 py-2 border rounded-md"/>
        <Button 
          text="APIキーをセット"
          variant="success"
          type="submit"
        />
      </form>
    )}
    </div>
  )
}