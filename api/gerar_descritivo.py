import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# 1. Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# 2. Inicializa o cliente do Gemini pegando a chave de forma segura
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("ERRO: A chave GEMINI_API_KEY não foi encontrada no arquivo .env ou nas variáveis de ambiente.")

client = genai.Client(api_key=api_key)

# 3. Função para carregar o Super System Prompt do arquivo .md
def carregar_system_prompt(caminho_arquivo: str = "system_prompt_seduc.md") -> str:
    caminhos_possiveis = [
        caminho_arquivo,
        os.path.join(os.path.dirname(__file__), "..", caminho_arquivo),
        os.path.join(os.getcwd(), caminho_arquivo),
    ]
    for caminho in caminhos_possiveis:
        if os.path.exists(caminho):
            with open(caminho, "r", encoding="utf-8") as f:
                return f.read()
    raise FileNotFoundError(f"O arquivo de prompt '{caminho_arquivo}' não foi encontrado na pasta.")

# 4. Função principal que processa a solicitação do usuário e gera o memorial descritivo
def gerar_memorial_descritivo(solicitacao_usuario: str) -> str:
    try:
        # Carrega as instruções do arquivo Markdown
        system_instruction_text = carregar_system_prompt("system_prompt_seduc.md")

        # Chama a API do Gemini utilizando a cascata de modelos flash de baixa latência (gemini-3.5-flash / gemini-2.5-flash)
        modelos_candidatos = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.8-flash"]
        response = None
        ultimo_erro = None
        for modelo in modelos_candidatos:
            try:
                response = client.models.generate_content(
                    model=modelo,
                    contents=solicitacao_usuario,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction_text,
                        temperature=0.2, # Temperatura baixa para garantir rigor técnico e fidelidade às regras
                    ),
                )
                break
            except Exception as err:
                ultimo_erro = err
        if response is None:
            raise ultimo_erro
        return response.text
    except Exception as e:
        return f"Erro ao gerar o descritivo técnico: {str(e)}"

# Alias de compatibilidade
gerar_descritivo_tecnico_seduc = gerar_memorial_descritivo

# ==========================================
# EXEMPLO DE USO PRÓPRIO PARA TESTE
# ==========================================
if __name__ == "__main__":
    # Teste simulando uma solicitação informal de campo
    pedido_teste = "recuperar as calçadas danificadas e trocar os vasos por acoplado nos banheiros"
    
    print("--- SOLICITAÇÃO ENVIADA ---")
    print(pedido_teste)
    print("\n--- RESPOSTA GERADA PELO GEMINI (ENGENHEIRO MASTER) ---")
    
    resultado = gerar_memorial_descritivo(pedido_teste)
    print(resultado)
