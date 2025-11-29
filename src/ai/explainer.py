# src/ai/explainer.py
import os
import json
import time

from groq import Groq

from dotenv import load_dotenv
load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if GROQ_API_KEY is None:
    raise RuntimeError("Please set GROQ_API_KEY environment variable")

client = Groq(api_key=GROQ_API_KEY)


def explain_with_llm(label: str, prob: float, threshold: float, max_tokens=300):
    
    # Détermination des termes
    above_below = "au-dessus" if prob > threshold else "en-dessous"
    margin = abs(prob - threshold)
    
    if margin > 0.25:
        tone = "élevée"
        certainty_desc = "très clairement"
        simple_confidence = "très confiant"
    elif margin > 0.10:
        tone = "modérée" 
        certainty_desc = "modérément"
        simple_confidence = "plutôt confiant"
    else:
        tone = "faible"
        certainty_desc = "de justesse"
        simple_confidence = "peu confiant"

    simple_label = "sans danger" if label.lower() == "bénigne" else "qui nécessite une attention particulière"

    meaning = (
        "Cette lésion présente des caractéristiques plutôt rassurantes selon mes critères d'analyse."
        if label.lower() == "bénigne"
        else "Cette lésion montre certains signes qui méritent une attention particulière."
    )

    prompt = f"""
    Tu es une IA éducative qui explique ses analyses de peau de manière complète et bienveillante.

    **MA PRÉDICTION :**
    - Classification : {label} ({simple_label})
    - Niveau de certitude : {prob:.0%}
    - Seuil de vigilance : {threshold:.0%}

    **PRODUIS UNE EXPLICATION COMPLÈTE AVEC CES SECTIONS :**

    1. **MON ANALYSE** :
    "En examinant cette image, j'ai détecté une lésion cutanée que je classe comme '{simple_label}'.
    Mon algorithme évalue la probabilité à {prob:.0%} sur 100."

    2. **MA CONFIANCE** :
    "Je compare toujours ce score à mon seuil de référence de {threshold:.0%}.
    Actuellement, je suis {certainty_desc} {above_below} cette limite, ce qui signifie une confiance {tone} dans cette analyse."

    3. **CE QUE CELA SIGNIFIE** :
    "{meaning}"

    4. **MES LIMITES** :
    "Je suis un programme d'intelligence artificielle entraîné sur des milliers d'images, mais je ne remplace pas l'expertise d'un dermatologue.
    Mes performances générales montrent une bonne fiabilité (précision de 96%), mais chaque cas est unique."

    5. **CONSEILS PRATIQUES** :
    "Je vous recommande de :
    - Consulter un professionnel de santé pour un diagnostic définitif
    - Surveiller l'évolution de cette lésion dans le temps
    - Photographier régulièrement pour suivre les changements
    - Protéger votre peau du soleil avec une crème solaire"

    **TON :** Pédagogique, rassurant et honnête sur les limites
    **LONGUEUR :** 8-10 phrases, texte fluide et structuré

    **FORMAT DE RÉPONSE :**
    {{
        "explanation": "Texte complet et détaillé avec sections naturelles",
        "confidence_level": "{tone}",
        "key_advice": "Principales recommandations en 1-2 phrases",
        "risk_level": "faible/moyen/élevé selon la classification"
    }}
    """


    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.2,
    )

    return response.choices[0].message.content.strip()
