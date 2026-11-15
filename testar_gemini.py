import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def testar_api_gemini():
    print("=== INICIANDO TESTE LOCAL DA API DO GEMINI (SEDUC-PI) ===")
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("❌ ERRO: GEMINI_API_KEY não encontrada no arquivo .env!")
        return

    prompt_path = "system_prompt_seduc.md"
    if not os.path.exists(prompt_path):
        print(f"❌ ERRO: Arquivo '{prompt_path}' não encontrado.")
        return

    with open(prompt_path, "r", encoding="utf-8") as f:
        system_instruction_text = f.read()

    client = genai.Client(api_key=api_key)
    entrada_teste = "recuperar o telhado do pátio e trocar os vasos sanitários por modelos com caixa acoplada"
    
    print(f"📤 Enviando solicitação: \"{entrada_teste}\"")

    try:
        modelos_candidatos = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.8-flash"]
        response = None
        ultimo_erro = None
        for modelo in modelos_candidatos:
            try:
                response = client.models.generate_content(
                    model=modelo,
                    contents=entrada_teste,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction_text,
                        temperature=0.2,
                    ),
                )
                break
            except Exception as err:
                ultimo_erro = err
        if response is None:
            raise ultimo_erro
        print("\n✅ RESPOSTA GERADA PELA IA:")
        print("-" * 50)
        print(response.text)
        print("-" * 50)
        print("\n🎉 Teste concluído com sucesso!")
    except Exception as e:
        print(f"\n❌ ERRO NA CHAMADA: {str(e)}")

if __name__ == "__main__":
    testar_api_gemini()
