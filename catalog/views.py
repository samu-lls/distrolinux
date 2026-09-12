from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404

from .data import DISTROS, DESKTOP_ENVIRONMENTS, QUIZ_QUESTIONS


def _distro_by_slug(slug):
    for d in DISTROS:
        if d["slug"] == slug:
            return d
    return None


def _editions_of(base_slug):
    return [d for d in DISTROS if d["base_slug"] == base_slug]


CATEGORY_LABELS = {
    "iniciante": "Quero algo parecido com o que já uso",
    "leve": "Meu computador é mais antigo ou limitado",
    "jogos": "Meu foco principal são jogos",
    "intermediario": "Quero estabilidade com pacotes atualizados",
    "avancado": "Quero aprender e configurar tudo manualmente",
    "seguranca": "Preciso de ferramentas de segurança/pentest",
    "base": "Distros-base (raramente usadas diretamente)",
}


def home(request):
    """Seções 1 e 2: crítica ao Windows + recomendação por categoria."""
    grouped = {}
    for d in DISTROS:
        if d["category"] == "base":
            continue
        grouped.setdefault(d["category"], []).append(d)

    categories = [
        {"key": key, "label": CATEGORY_LABELS.get(key, key), "distros": items}
        for key, items in grouped.items()
    ]

    context = {"categories": categories}
    return render(request, "catalog/home.html", context)


def diagram(request):
    """Seção 3: árvore de bases e derivadas."""
    roots = [d for d in DISTROS if d["base_slug"] is None]

    def build_node(distro):
        return {
            "distro": distro,
            "children": [build_node(child) for child in _editions_of(distro["slug"])],
        }

    tree = [build_node(root) for root in roots]
    return render(request, "catalog/diagram.html", {"tree": tree})


def distro_detail(request, slug):
    distro = _distro_by_slug(slug)
    if distro is None:
        raise Http404("Distro não encontrada")

    base = _distro_by_slug(distro["base_slug"]) if distro["base_slug"] else None
    editions = _editions_of(distro["slug"])

    context = {"distro": distro, "base": base, "editions": editions}
    return render(request, "catalog/distro_detail.html", context)


# --- Quiz ---
# O progresso do quiz fica guardado na sessão do navegador (sem banco de dados).

QUIZ_SESSION_KEY = "quiz_answers"


def quiz_start(request):
    request.session[QUIZ_SESSION_KEY] = {}
    return redirect("quiz_question", number=1)


def quiz_question(request, number):
    total = len(QUIZ_QUESTIONS)
    if number < 1 or number > total:
        raise Http404("Pergunta inválida")

    question = QUIZ_QUESTIONS[number - 1]

    if request.method == "POST":
        chosen_index = request.POST.get("option")
        answers = request.session.get(QUIZ_SESSION_KEY, {})
        if chosen_index is not None:
            answers[str(number)] = int(chosen_index)
        request.session[QUIZ_SESSION_KEY] = answers

        if number < total:
            return redirect("quiz_question", number=number + 1)
        return redirect("quiz_result")

    context = {
        "question": question,
        "number": number,
        "total": total,
        "progress_percent": int((number - 1) / total * 100),
    }
    return render(request, "catalog/quiz_question.html", context)


def quiz_result(request):
    answers = request.session.get(QUIZ_SESSION_KEY)
    if not answers:
        return redirect("quiz_start")

    scores = {}
    reasons = {}  # slug -> lista de textos das opções escolhidas que pontuaram

    for question_number_str, option_index in answers.items():
        question = QUIZ_QUESTIONS[int(question_number_str) - 1]
        option = question["options"][option_index]
        for slug, points in option["weights"].items():
            scores[slug] = scores.get(slug, 0) + points
            reasons.setdefault(slug, []).append(option["text"])

    if not scores:
        return render(request, "catalog/quiz_result.html", {"results": []})

    max_score = max(scores.values())
    ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)[:3]

    results = []
    for slug, score in ranked:
        distro = _distro_by_slug(slug)
        if distro is None:
            continue
        percent = int(score / max_score * 100) if max_score else 0
        results.append({
            "distro": distro,
            "percent": percent,
            "reasons": reasons.get(slug, []),
        })

    return render(request, "catalog/quiz_result.html", {"results": results})
