import json
import logging
import random
import requests
from django.conf import settings
from .ai_service import check_ollama_health, OLLAMA_BASE_URL, OLLAMA_MODEL, AI_TIMEOUT_SECONDS

logger = logging.getLogger(__name__)

# Comprehensive, verified question bank fallback categorized by topic and difficulty
QUESTION_BANK = {
    'Python': {
        'BEGINNER': [
            {
                'question': 'What are mutable vs immutable data types in Python, and how does Python manage references to them?',
                'topic': 'Python',
                'difficulty': 'Beginner',
                'evaluation_points': [
                    'Identifies lists, dicts, sets as mutable; ints, strings, tuples as immutable',
                    'Explains object id and reference reassignment behavior',
                    'Mentions implications when passing mutable objects as default arguments'
                ],
                'suggested_answer': 'Immutable types cannot be altered after creation; modifications create a new object. Mutable types can be modified in place. Passing mutable defaults (e.g. def func(x=[])) creates shared state across function invocations.'
            },
            {
                'question': 'How does Python handle list comprehensions compared to standard for-loops in terms of readability and execution?',
                'topic': 'Python',
                'difficulty': 'Beginner',
                'evaluation_points': [
                    'Syntactic clarity for simple transformations',
                    'Slightly faster execution in CPython bytecode',
                    'When to avoid comprehensions (complex nested loops impacting readability)'
                ],
                'suggested_answer': 'List comprehensions provide a concise way to create lists using [expr for item in iterable if condition]. They are executed in C-level loops in CPython, making them typically faster than explicit append calls.'
            }
        ],
        'INTERMEDIATE': [
            {
                'question': 'How do Python generators work, and what advantages does the `yield` statement provide in terms of memory efficiency?',
                'topic': 'Python',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Explains generator function state preservation (iterator protocol)',
                    'Lazy evaluation vs loading entire collections into memory',
                    'Appropriate use cases for processing large log files or streaming data'
                ],
                'suggested_answer': 'Generators produce values on demand using `yield` without storing the complete sequence in memory. They maintain state between iterations, providing O(1) auxiliary space complexity during stream processing.'
            },
            {
                'question': 'Explain the difference between `deepcopy` and shallow copy in Python with real-world object examples.',
                'topic': 'Python',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Shallow copy copies the container but references nested objects',
                    'Deepcopy recursively duplicates all child objects',
                    'Uses the standard copy module'
                ],
                'suggested_answer': 'A shallow copy (e.g. list.copy() or copy.copy()) constructs a new compound object and inserts references to the original nested elements. `copy.deepcopy()` recursively copies all nested objects, preventing side-effects when mutating nested structures.'
            }
        ],
        'ADVANCED': [
            {
                'question': 'What is Python\'s Global Interpreter Lock (GIL), how does it affect CPU-bound vs I/O-bound concurrency, and how does Python 3.12+ address this?',
                'topic': 'Python',
                'difficulty': 'Advanced',
                'evaluation_points': [
                    'Explains GIL mutex preventing concurrent execution of CPython bytecode',
                    'Impact on CPU-bound threading vs multiprocessing',
                    'Why I/O-bound tasks release the GIL during syscalls',
                    'Awareness of per-interpreter GIL or free-threaded Python developments'
                ],
                'suggested_answer': 'The GIL ensures memory safety in CPython by allowing only one native thread to execute bytecode at a time. Multi-threading is effective for I/O operations (network, disk) because the GIL is released during wait states, but CPU-bound tasks require multiprocessing or C-extensions to achieve true parallelism.'
            }
        ]
    },
    'Django REST Framework': {
        'BEGINNER': [
            {
                'question': 'What is the role of Serializers in Django REST Framework, and how do they differ from Django ModelForms?',
                'topic': 'Django REST Framework',
                'difficulty': 'Beginner',
                'evaluation_points': [
                    'Converts complex model instances to native Python datatypes for JSON serialization',
                    'Deserialization and input validation logic',
                    'ModelForms produce HTML form representations; DRF serializers produce API payloads'
                ],
                'suggested_answer': 'DRF Serializers translate QuerySets and model instances into JSON/XML payloads and validate incoming untrusted request data before saving to the database.'
            }
        ],
        'INTERMEDIATE': [
            {
                'question': 'How do `select_related` and `prefetch_related` resolve the N+1 query problem in Django ORM, and when should you choose each?',
                'topic': 'Django REST Framework',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'select_related uses SQL JOIN for single-valued relationships (ForeignKey, OneToOne)',
                    'prefetch_related performs a separate batch query with IN (...) for ManyToMany or reverse relations',
                    'Impact on database connection load and memory footprint'
                ],
                'suggested_answer': '`select_related` creates an SQL JOIN in a single query, suitable for ForeignKey and OneToOne. `prefetch_related` executes separate queries and links objects in Python memory, ideal for ManyToMany and reverse ForeignKey lookups.'
            },
            {
                'question': 'How do DRF Permission classes and Authentication classes interact during request dispatch?',
                'topic': 'Django REST Framework',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Authentication runs first to identify request.user',
                    'has_permission checks view-level access',
                    'has_object_permission checks individual instance access during get_object()'
                ],
                'suggested_answer': 'DRF evaluates authentication classes to populate `request.user` and `request.auth`. Then, view-level permissions (`has_permission`) evaluate whether the user can access the endpoint. For detail endpoints, `has_object_permission` verifies access against specific model instances.'
            }
        ],
        'ADVANCED': [
            {
                'question': 'How would you architect database transactions and error handling in DRF when creating an application and generating related audit logs atomically?',
                'topic': 'Django REST Framework',
                'difficulty': 'Advanced',
                'evaluation_points': [
                    'Use of django.db.transaction.atomic() context manager or decorator',
                    'Proper rollbacks on unhandled exceptions',
                    'Handling non-database side-effects (e.g. sending emails outside the commit block)'
                ],
                'suggested_answer': 'Wrap multi-step database mutations in `with transaction.atomic():`. Ensure unhandled database exceptions trigger automatic rollbacks, and defer external network calls (such as email or external webhooks) using `transaction.on_commit()` to prevent false dispatches on rollback.'
            }
        ]
    },
    'React.js': {
        'BEGINNER': [
            {
                'question': 'What are React hooks, and what rules must be followed when using them?',
                'topic': 'React.js',
                'difficulty': 'Beginner',
                'evaluation_points': [
                    'Hooks allow functional components to use state and lifecycle methods',
                    'Rule 1: Only call hooks at the top level (never in loops, conditions, or nested functions)',
                    'Rule 2: Only call hooks from React function components or custom hooks'
                ],
                'suggested_answer': 'Hooks (useState, useEffect, etc.) allow functional components to manage state and side effects. They must be called unconditionally at the top level so React can reliably preserve hook state order across renders.'
            }
        ],
        'INTERMEDIATE': [
            {
                'question': 'What are the main causes of unnecessary re-renders in React, and how can they be mitigated using `useMemo`, `useCallback`, and component composition?',
                'topic': 'React.js',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Parent re-renders trigger children re-renders by default',
                    'Re-creating object references and callback functions every render',
                    'Proper use of React.memo, useCallback, and lifting state down'
                ],
                'suggested_answer': 'Unnecessary renders occur when state updates cause entire subtrees to execute. `useCallback` memoizes function instances, `useMemo` caches computed values, and `React.memo` performs shallow prop comparison to skip rendering when props have not changed.'
            }
        ],
        'ADVANCED': [
            {
                'question': 'How does React 18\'s Concurrent Mode and Automatic Batching work, and how does it prevent UI blocking during heavy DOM updates?',
                'topic': 'React.js',
                'difficulty': 'Advanced',
                'evaluation_points': [
                    'Automatic batching for promises, setTimeout, and native event handlers',
                    'Interruptible rendering allowing browser to handle high-priority user input',
                    'useTransition and useDeferredValue for non-urgent state updates'
                ],
                'suggested_answer': 'React 18 batches multiple state updates into a single re-render even across async boundaries. Concurrent rendering splits work into interruptible units, allowing urgent events (keystrokes, clicks) to pause lower-priority background renders using `useTransition`.'
            }
        ]
    },
    'PostgreSQL': {
        'BEGINNER': [
            {
                'question': 'What is the purpose of an Index in PostgreSQL, and what is the trade-off of indexing every column in a table?',
                'topic': 'PostgreSQL',
                'difficulty': 'Beginner',
                'evaluation_points': [
                    'Indexes (B-Tree default) drastically accelerate SELECT query filtering and sorting',
                    'Indexes increase write latency (INSERT, UPDATE, DELETE) because indexes must also be updated',
                    'Indexes consume disk storage and memory (shared_buffers)'
                ],
                'suggested_answer': 'An index provides fast lookups for specific columns without scanning the entire table. However, each index incurs disk overhead and slows down write operations since the index structure must be maintained during every INSERT/UPDATE.'
            }
        ],
        'INTERMEDIATE': [
            {
                'question': 'How does PostgreSQL use MVCC (Multi-Version Concurrency Control) to provide transaction isolation without locking readers?',
                'topic': 'PostgreSQL',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Readers do not block writers, and writers do not block readers',
                    'Use of xmin and xmax transaction IDs on tuples',
                    'Role of VACUUM in reclaiming dead tuple space'
                ],
                'suggested_answer': 'PostgreSQL uses MVCC so each transaction views a consistent snapshot of the data. UPDATES write a new tuple with updated xmin/xmax IDs instead of overwriting data in place. Autovacuum reclaims dead tuple storage once transactions complete.'
            }
        ],
        'ADVANCED': [
            {
                'question': 'Explain how you would diagnose and optimize a slow query in PostgreSQL using `EXPLAIN (ANALYZE, BUFFERS)`.',
                'topic': 'PostgreSQL',
                'difficulty': 'Advanced',
                'evaluation_points': [
                    'Difference between estimated cost and actual runtime',
                    'Sequential scan vs Index scan / Bitmap index scan',
                    'Buffer cache hit ratio vs disk reads',
                    'Query planner statistics and ANALYZE'
                ],
                'suggested_answer': 'Running `EXPLAIN (ANALYZE, BUFFERS)` reveals actual execution time, rows returned vs estimated, and whether data was read from memory (hit) or disk (read). Look for costly sequential scans on large tables, nested loops on unindexed foreign keys, or memory spills in sorting/hashing.'
            }
        ]
    },
    'Problem Solving': {
        'INTERMEDIATE': [
            {
                'question': 'Describe a situation where you had to debug a difficult performance issue in a web application. What was your systematic approach to locate and fix the bottleneck?',
                'topic': 'Problem Solving',
                'difficulty': 'Intermediate',
                'evaluation_points': [
                    'Scientific approach: measuring before optimizing (profiling, logs, APM)',
                    'Isolating layers (network, database query, application code, frontend render)',
                    'Verifying the fix with benchmark measurements'
                ],
                'suggested_answer': 'Candidate should outline a structured debugging methodology: reproducing the issue, capturing metrics with profilers/explain analyze, identifying root cause, applying minimal targeted fix, and validating improvement with benchmarks.'
            }
        ]
    }
}


def get_rule_based_questions(topic, difficulty, count=3):
    """
    Selects structured technical interview questions from the verified question bank.
    """
    topic_data = QUESTION_BANK.get(topic)
    if not topic_data:
        # Fall back to General Full-Stack / Python
        topic_data = QUESTION_BANK.get('Python')

    available = []
    # Try requested difficulty first
    if difficulty in topic_data:
        available.extend(topic_data[difficulty])

    # If not enough, pull from other difficulties in the same topic
    for diff, q_list in topic_data.items():
        if diff != difficulty:
            for q in q_list:
                if q not in available:
                    available.append(q)

    # If still not enough, augment with related topics
    if len(available) < count:
        for t_name, t_content in QUESTION_BANK.items():
            if t_name != topic:
                for diff, q_list in t_content.items():
                    for q in q_list:
                        if q not in available:
                            available.append(q)

    # Randomly select requested count
    selected = available[:count] if len(available) >= count else available
    return selected


def generate_interview_questions_ollama(job, candidate, topic, difficulty, count=3):
    """
    Uses local Ollama LLM to generate customized technical interview questions.
    """
    prompt = f"""You are a senior technical interviewer designing technical interview questions for a hiring team.
Target Job: {job.title} ({job.department})
Required Skills: {json.dumps(job.required_skills)}
Topic: {topic}
Difficulty Level: {difficulty}
Number of Questions Needed: {count}
{f"Candidate Name: {candidate.full_name}" if candidate else ""}
{f"Candidate Stated Skills: {json.dumps(candidate.skills)}" if candidate and candidate.skills else ""}

Generate exactly {count} distinct, professional technical interview questions appropriate for the specified difficulty level.
Return valid JSON matching this schema:
{{
  "questions": [
    {{
      "question": "Clear, practical technical question",
      "topic": "{topic}",
      "difficulty": "{difficulty}",
      "evaluation_points": ["Point 1", "Point 2", "Point 3"],
      "suggested_answer": "Model technical answer summarizing key evaluation points"
    }}
  ]
}}
"""

    url = f"{OLLAMA_BASE_URL.rstrip('/')}/api/generate"
    payload = {
        'model': OLLAMA_MODEL,
        'prompt': prompt,
        'stream': False,
        'format': 'json',
        'options': {
            'temperature': 0.3,
            'num_ctx': 4096,
        }
    }

    response = requests.post(url, json=payload, timeout=AI_TIMEOUT_SECONDS)
    response.raise_for_status()
    raw = response.json().get('response', '')
    parsed = json.loads(raw)

    raw_questions = parsed.get('questions', [])
    valid_questions = []

    for item in raw_questions:
        if isinstance(item, dict) and 'question' in item:
            valid_questions.append({
                'question': str(item.get('question', '')).strip(),
                'topic': str(item.get('topic', topic)).strip(),
                'difficulty': str(item.get('difficulty', difficulty)).strip(),
                'evaluation_points': [str(p).strip() for p in item.get('evaluation_points', []) if p],
                'suggested_answer': str(item.get('suggested_answer', '')).strip(),
            })

    if not valid_questions:
        raise ValueError("Model produced no valid questions.")

    return valid_questions[:count]


def generate_interview_question_set(job, candidate, topic, difficulty, count=3, user=None):
    """
    Main generator service for interview question sets.
    Tries Ollama inference first; falls back seamlessly to the verified question bank.
    """
    health = check_ollama_health()
    questions = []
    is_ai_generated = False

    if health['available'] and health.get('model_installed'):
        try:
            logger.info(f"Generating questions with Ollama model {OLLAMA_MODEL} on topic '{topic}'")
            questions = generate_interview_questions_ollama(job, candidate, topic, difficulty, count)
            is_ai_generated = True
        except Exception as e:
            logger.warning(f"Ollama question generation failed ({str(e)}). Using verified question bank.")

    if not questions:
        questions = get_rule_based_questions(topic, difficulty, count)
        is_ai_generated = False

    return {
        'topic': topic,
        'difficulty': difficulty,
        'questions': questions,
        'is_ai_generated': is_ai_generated,
    }
