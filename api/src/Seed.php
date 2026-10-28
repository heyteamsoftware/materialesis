<?php
declare(strict_types=1);

/**
 * Datos iniciales: cuenta de administración y biblioteca de ejemplo.
 * Formato del texto de las páginas (lo interpreta el visor):
 *   ## Subtítulo · - viñeta · [ ] casilla · > destacado · ___ líneas para escribir
 */
final class Seed
{
    public static function run(array $config): void
    {
        $now = Db::now();
        Db::insert('users', [
            'username'      => $config['admin_user'],
            'name'          => 'Administración',
            'email'         => 'admin@materialesis.local',
            'password_hash' => password_hash($config['admin_pass'], PASSWORD_DEFAULT),
            'role'          => 'admin',
            'created_at'    => $now,
        ]);

        foreach (self::materials() as $section => $items) {
            foreach ($items as $pos => $m) {
                Db::insert('materials', [
                    'section'         => $section,
                    'title'           => $m['title'],
                    'summary'         => $m['summary'],
                    'kind'            => $m['kind'],
                    'access'          => $m['access'] ?? 'premium',
                    'format'          => $m['format'] ?? '',
                    'duration'        => $m['duration'] ?? '',
                    'audience'        => $m['audience'] ?? '',
                    'interactive_key' => $m['interactive'] ?? null,
                    'embed_url'       => null,
                    'pages'           => json_encode(array_map(
                        fn ($p) => ['type' => 'text', 'title' => $p[0], 'body' => $p[1]],
                        $m['pages'] ?? []
                    ), JSON_UNESCAPED_UNICODE),
                    'position'        => ($pos + 1) * 10,
                    'published'       => 1,
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }
        }

        // Reseñas de ejemplo, pendientes de moderación: sirven para probar el panel.
        $examples = [
            [5, 'Ejemplo · Integradora social', 'Reseña de ejemplo: el ecomapa interactivo me ha ahorrado una tarde entera de preparar fichas para el grupo.'],
            [4, 'Ejemplo · Educador social', 'Reseña de ejemplo: las tarjetas multilingües funcionan muy bien en la acogida. Echo de menos más idiomas.'],
            [5, 'Ejemplo · Trabajadora social', 'Reseña de ejemplo: el protocolo de mediación está muy bien estructurado y es fácil de adaptar a cada caso.'],
        ];
        foreach ($examples as [$rating, $role, $body]) {
            Db::insert('reviews', [
                'user_id' => null, 'author_name' => 'Reseña de ejemplo', 'author_role' => $role,
                'section' => null, 'rating' => $rating, 'body' => $body, 'status' => 'pending', 'created_at' => $now,
            ]);
        }
    }

    private static function premium(string $objective, array $steps): array
    {
        return [[
            'Guía de uso',
            "## Objetivo\n$objective\n\n## Cómo usarlo\n- " . implode("\n- ", $steps)
            . "\n\n> Material completo disponible para descarga con la licencia anual.",
        ]];
    }

    private static function materials(): array
    {
        return [
            'contexto' => [
                [
                    'title' => 'Guía de lectura del territorio',
                    'summary' => 'Ficha de trabajo para analizar un barrio o municipio antes de intervenir: recursos, agentes, necesidades y fortalezas.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Ficha imprimible · 3 págs.', 'duration' => '60–90 min', 'audience' => 'Equipos y alumnado en prácticas',
                    'pages' => [
                        ['Antes de intervenir, mirar el barrio', "Ningún proyecto empieza de cero: cada territorio tiene historia, redes y conflictos propios. Esta guía ayuda a ordenar lo que vemos para no intervenir a ciegas.\n\n## Recorrido de observación\n[ ] Equipamientos públicos (centro de salud, colegio, biblioteca, centro cívico)\n[ ] Espacios de encuentro informales (plazas, bares, parques, parroquias)\n[ ] Comercio de proximidad y actividad económica\n[ ] Barreras físicas: accesibilidad, transporte, iluminación\n[ ] Señales de vida asociativa: carteles, murales, convocatorias\n\n> Consejo: haz el recorrido a dos horas distintas del día. El barrio cambia."],
                        ['Mapa de agentes', "## Agentes formales\nServicios sociales, educativos, sanitarios, de empleo y seguridad.\n___\n___\n\n## Agentes informales\nAsociaciones vecinales, grupos de madres y padres, colectivos culturales, personas referentes.\n___\n___\n\n## ¿Quién falta?\nAnota los colectivos que no aparecen en ningún espacio de participación.\n___"],
                        ['Lectura DAFO del contexto', "## Debilidades\nLo que limita al territorio desde dentro.\n___\n\n## Amenazas\nFactores externos que pueden empeorar la situación.\n___\n\n## Fortalezas\nRecursos, redes y saberes que ya existen.\n___\n\n## Oportunidades\nProgramas, convocatorias o cambios que se pueden aprovechar.\n___\n\n> Cierra con una frase: «Lo más urgente es… y lo más valioso que tenemos es…»"],
                    ],
                ],
                [
                    'title' => 'Ecomapa interactivo de la red de apoyo',
                    'summary' => 'Dibuja en pantalla la red de una persona o familia: vínculos fuertes, débiles o conflictivos con su entorno.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'ecomapa', 'format' => 'Herramienta web', 'duration' => '20 min', 'audience' => 'Entrevista individual o familiar',
                ],
                ['title' => 'Dossier de legislación básica en servicios sociales', 'summary' => 'Resumen comentado de la normativa estatal y autonómica esencial, con esquemas de competencias.', 'kind' => 'fisico', 'format' => 'Dossier PDF · 24 págs.', 'audience' => 'Formación y consulta',
                    'pages' => self::premium('Tener a mano el marco normativo sin perderse en el BOE.', ['Consulta el esquema de competencias de la pág. 3.', 'Usa las fichas resumen como material de clase.', 'Actualiza la tabla autonómica con tu comunidad.'])],
                ['title' => 'Plantilla de informe social de contexto', 'summary' => 'Estructura editable para redactar informes de contexto claros, con ejemplos de redacción no estigmatizante.', 'kind' => 'fisico', 'format' => 'Plantilla editable (.docx)', 'audience' => 'Profesionales',
                    'pages' => self::premium('Redactar informes de contexto completos en menos tiempo.', ['Rellena cada apartado siguiendo las preguntas guía.', 'Revisa el glosario de lenguaje inclusivo.', 'Adjunta el ecomapa como anexo.'])],
                ['title' => 'Línea del tiempo de las políticas sociales', 'summary' => 'Recorrido interactivo por los hitos de la protección social en España, del asistencialismo al sistema de derechos.', 'kind' => 'digital', 'format' => 'Interactivo', 'duration' => '30 min', 'audience' => 'Aula',
                    'pages' => self::premium('Comprender la evolución de los servicios sociales.', ['Explora cada etapa y su contexto.', 'Responde a las preguntas de reflexión.'])],
                ['title' => 'Fichas de colectivos en situación de vulnerabilidad', 'summary' => 'Doce fichas con datos, factores de riesgo y de protección, recursos y buenas prácticas por colectivo.', 'kind' => 'fisico', 'format' => '12 fichas imprimibles', 'audience' => 'Formación y equipos',
                    'pages' => self::premium('Disponer de una visión rápida y rigurosa de cada colectivo.', ['Usa una ficha por grupo de trabajo.', 'Contrasta los datos con tu territorio.'])],
            ],

            'inmersion' => [
                [
                    'title' => 'Diario de campo para la observación participante',
                    'summary' => 'Cuaderno pautado para registrar la primera inmersión en un servicio o grupo: hechos, interpretaciones y emociones por separado.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Cuaderno imprimible · 2 págs.', 'duration' => 'Uso continuado', 'audience' => 'Alumnado en prácticas',
                    'pages' => [
                        ['Cómo usar este diario', "Observar no es juzgar. Este diario separa lo que vemos de lo que pensamos y de lo que sentimos, para que la reflexión sea honesta y útil.\n\n## Tres columnas, tres miradas\n- Hechos: qué ocurre, quién, cuándo, dónde. Sin adjetivos.\n- Interpretación: qué creo que significa.\n- Resonancia: qué me ha removido a mí.\n\n> Escribe al terminar la jornada, no durante la actividad."],
                        ['Registro de jornada', "## Fecha y lugar\n___\n\n## Hechos observados\n___\n___\n___\n\n## Mi interpretación\n___\n___\n\n## Lo que me ha removido\n___\n\n## Pregunta para la supervisión\n___"],
                    ],
                ],
                [
                    'title' => 'Simulador de primera entrevista',
                    'summary' => 'Caso ramificado: elige cómo responder en una primera acogida y recibe retroalimentación sobre cada decisión.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'entrevista', 'format' => 'Simulación', 'duration' => '15 min', 'audience' => 'Formación individual',
                ],
                ['title' => 'Dinámicas de acogida para grupos nuevos', 'summary' => 'Veinte dinámicas para romper el hielo y crear confianza, clasificadas por edad, tamaño del grupo y tiempo.', 'kind' => 'fisico', 'format' => 'Fichero · 20 dinámicas', 'audience' => 'Grupos',
                    'pages' => self::premium('Crear un clima seguro desde la primera sesión.', ['Filtra por edad y tamaño del grupo.', 'Combina una dinámica de nombres con una de expectativas.'])],
                ['title' => 'Guía de la visita domiciliaria', 'summary' => 'Antes, durante y después de la visita: preparación, registro, seguridad y devolución a la familia.', 'kind' => 'fisico', 'format' => 'Guía PDF · 10 págs.', 'audience' => 'Profesionales',
                    'pages' => self::premium('Hacer visitas respetuosas, seguras y bien documentadas.', ['Revisa la lista previa de comprobación.', 'Usa la hoja de registro posterior.'])],
                ['title' => 'Cuaderno de role-playing: 15 situaciones', 'summary' => 'Situaciones reales para ensayar en el aula con guion para cada rol y pauta de observación.', 'kind' => 'fisico', 'format' => 'Cuaderno · 15 casos', 'audience' => 'Aula',
                    'pages' => self::premium('Practicar habilidades antes de llegar al servicio.', ['Reparte roles y pauta de observación.', 'Cierra cada ensayo con una ronda de devolución.'])],
                ['title' => 'Escape room de sensibilización', 'summary' => 'Juego digital por equipos sobre prejuicios y barreras cotidianas, con guía para la dinamización.', 'kind' => 'digital', 'format' => 'Juego web', 'duration' => '45 min', 'audience' => 'Grupos de 12 a 30 años',
                    'pages' => self::premium('Sensibilizar desde la experiencia y el juego.', ['Proyecta el juego y forma equipos.', 'Usa las preguntas de cierre para el debate.'])],
            ],

            'fol' => [
                [
                    'title' => 'Mi proyecto profesional en 4 pasos',
                    'summary' => 'Ficha guiada para que la persona usuaria defina su objetivo laboral, sus fortalezas y un plan de acción realista.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Ficha imprimible · 2 págs.', 'duration' => '45 min', 'audience' => 'Itinerarios de inserción',
                    'pages' => [
                        ['Paso 1 y 2: quién soy y qué busco', "## 1. Lo que sé hacer\nPiensa en trabajos, cuidados, voluntariado, aficiones. Todo cuenta.\n___\n___\n\n## 2. Lo que me gustaría hacer\nEscribe tres empleos que te interesen, de más a menos.\n- ___\n- ___\n- ___\n\n> No hace falta tenerlo claro hoy: es un punto de partida."],
                        ['Paso 3 y 4: qué me falta y qué haré', "## 3. Lo que necesito\n[ ] Formación\n[ ] Carné o certificado\n[ ] Experiencia\n[ ] Conciliación o transporte\n[ ] Otro: ___\n\n## 4. Mi plan para este mes\nTres acciones pequeñas y concretas, con fecha.\n- ___\n- ___\n- ___"],
                    ],
                ],
                [
                    'title' => 'Radar de competencias para la empleabilidad',
                    'summary' => 'Autoevaluación de ocho competencias transversales con gráfico radar y sugerencias de mejora.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'competencias', 'format' => 'Herramienta web', 'duration' => '10 min', 'audience' => 'Orientación individual',
                ],
                ['title' => 'Banco de preguntas de entrevista comentadas', 'summary' => 'Sesenta preguntas frecuentes con claves para responder y errores habituales, en lenguaje sencillo.', 'kind' => 'fisico', 'format' => 'Cuadernillo · 18 págs.', 'audience' => 'Itinerarios de inserción',
                    'pages' => self::premium('Preparar entrevistas con seguridad.', ['Selecciona 10 preguntas por sesión.', 'Graba y revisa las respuestas.'])],
                ['title' => 'Plantillas de currículum adaptadas', 'summary' => 'Modelos Europass, funcional y creativo, más una versión de lectura fácil.', 'kind' => 'fisico', 'format' => 'Plantillas editables', 'audience' => 'Personas usuarias',
                    'pages' => self::premium('Elaborar un CV adaptado a cada perfil.', ['Elige modelo según la experiencia previa.', 'Completa con la ficha de logros.'])],
                ['title' => 'Simulador de nómina', 'summary' => 'Calcula una nómina sencilla y entiende cada concepto: devengos, deducciones y líquido a percibir.', 'kind' => 'digital', 'format' => 'Calculadora web', 'duration' => '20 min', 'audience' => 'Aula y orientación',
                    'pages' => self::premium('Entender una nómina real.', ['Introduce el salario base y complementos.', 'Comenta cada deducción con el grupo.'])],
                ['title' => 'Taller de búsqueda activa de empleo', 'summary' => 'Programa completo de seis sesiones con fichas, presentaciones y evaluación.', 'kind' => 'fisico', 'format' => 'Programa · 6 sesiones', 'audience' => 'Grupos',
                    'pages' => self::premium('Dinamizar un taller grupal completo.', ['Sigue la secuencia de sesiones.', 'Adapta los ejemplos al mercado local.'])],
            ],

            'metodologia' => [
                [
                    'title' => 'Plantilla de diseño de proyecto de intervención',
                    'summary' => 'Estructura paso a paso para diseñar un proyecto: diagnóstico, objetivos, actividades, recursos y evaluación.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Plantilla · 3 págs.', 'duration' => '2–3 sesiones', 'audience' => 'Equipos y alumnado',
                    'pages' => [
                        ['1. Diagnóstico y justificación', "## ¿Qué necesidad detectamos?\n___\n___\n\n## ¿Cómo lo sabemos?\nFuentes: entrevistas, datos, observación, demanda directa.\n___\n\n## ¿Por qué ahora y aquí?\n___\n\n> Un buen diagnóstico nombra también las fortalezas del grupo."],
                        ['2. Objetivos y actividades', "## Objetivo general\nUna sola frase, en infinitivo.\n___\n\n## Objetivos específicos\n- ___\n- ___\n- ___\n\n## Actividades\nCada actividad debe responder a un objetivo específico.\n___\n___"],
                        ['3. Recursos y evaluación', "## Recursos\n- Humanos: ___\n- Materiales: ___\n- Económicos: ___\n\n## Indicadores de evaluación\n[ ] De proceso (participación, asistencia)\n[ ] De resultado (cambios logrados)\n[ ] De satisfacción (voz de las personas)\n___"],
                    ],
                ],
                [
                    'title' => 'Planificador de sesiones grupales',
                    'summary' => 'Organiza las fases de una sesión, controla el tiempo de cada bloque e imprime el guion final.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'planificador', 'format' => 'Herramienta web', 'duration' => '10 min', 'audience' => 'Dinamización de grupos',
                ],
                ['title' => 'Banco de 40 técnicas de recogida de información', 'summary' => 'Entrevista, grupo de discusión, fotovoz, cartografía social y más, con cuándo y cómo usar cada una.', 'kind' => 'fisico', 'format' => 'Fichero · 40 técnicas', 'audience' => 'Profesionales',
                    'pages' => self::premium('Elegir la técnica adecuada para cada diagnóstico.', ['Consulta la tabla de selección rápida.', 'Revisa las consideraciones éticas de cada técnica.'])],
                ['title' => 'Rúbricas de evaluación de la intervención', 'summary' => 'Rúbricas listas para evaluar proyectos, sesiones y participación, con escalas descritas.', 'kind' => 'fisico', 'format' => 'Rúbricas editables', 'audience' => 'Equipos y docentes',
                    'pages' => self::premium('Evaluar con criterios compartidos.', ['Adapta los descriptores a tu contexto.', 'Comparte la rúbrica con el grupo antes de empezar.'])],
                ['title' => 'Generador de objetivos SMART', 'summary' => 'Asistente que transforma una intención general en objetivos específicos, medibles y temporizados.', 'kind' => 'digital', 'format' => 'Herramienta web', 'duration' => '10 min', 'audience' => 'Diseño de proyectos',
                    'pages' => self::premium('Redactar objetivos evaluables.', ['Escribe la intención general.', 'Responde a las cinco preguntas del asistente.'])],
                ['title' => 'Guía de indicadores para proyectos sociales', 'summary' => 'Más de cien indicadores organizados por ámbito, con fuente de verificación sugerida.', 'kind' => 'fisico', 'format' => 'Guía PDF · 20 págs.', 'audience' => 'Profesionales',
                    'pages' => self::premium('Medir lo que importa.', ['Busca por ámbito de intervención.', 'Combina indicadores cuantitativos y cualitativos.'])],
            ],

            'promocion' => [
                [
                    'title' => 'Agenda visual de rutinas de autonomía',
                    'summary' => 'Secuencias visuales para trabajar rutinas diarias (higiene, compra, transporte) con personas que necesitan apoyos.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Láminas · 2 págs.', 'duration' => 'Uso diario', 'audience' => 'Promoción de la autonomía personal',
                    'pages' => [
                        ['Rutina de la mañana', "## Antes de salir de casa\n[ ] 1. Me levanto y abro la ventana\n[ ] 2. Voy al baño y me lavo\n[ ] 3. Me visto con la ropa preparada\n[ ] 4. Desayuno\n[ ] 5. Me lavo los dientes\n[ ] 6. Reviso: llaves, móvil, tarjeta de transporte\n\n> Recorta cada paso y colócalo en orden con velcro. Retira apoyos a medida que la rutina se automatiza."],
                        ['Ir a la compra', "## Preparo\n[ ] Hago la lista con dibujos o fotos\n[ ] Cojo el dinero o la tarjeta y una bolsa\n\n## En la tienda\n[ ] Busco cada producto de la lista\n[ ] Compruebo el precio\n[ ] Pago y espero el cambio\n\n## Al volver\n[ ] Guardo cada cosa en su sitio\n\n## Me valoro\nHoy lo he hecho: sola / con un poco de ayuda / con ayuda\n___"],
                    ],
                ],
                [
                    'title' => 'Generador de carteles para actividades comunitarias',
                    'summary' => 'Crea en minutos un cartel claro y accesible para difundir una actividad del barrio o del centro.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'cartel', 'format' => 'Herramienta web', 'duration' => '5 min', 'audience' => 'Dinamización comunitaria',
                ],
                ['title' => 'Programa de habilidades de la vida diaria', 'summary' => 'Doce unidades para entrenar habilidades domésticas, de autocuidado y de gestión del dinero.', 'kind' => 'fisico', 'format' => 'Programa · 12 unidades', 'audience' => 'Centros y pisos tutelados',
                    'pages' => self::premium('Ganar autonomía en el día a día.', ['Evalúa el punto de partida con la escala inicial.', 'Trabaja una unidad por semana.'])],
                ['title' => 'Fichas de educación para la salud', 'summary' => 'Alimentación, descanso, medicación y prevención en lectura fácil y con apoyo visual.', 'kind' => 'fisico', 'format' => '16 fichas', 'audience' => 'Personas usuarias',
                    'pages' => self::premium('Promover hábitos saludables con materiales accesibles.', ['Usa una ficha por sesión.', 'Comprueba la comprensión con las preguntas finales.'])],
                ['title' => 'Juego de mesa: la ciudad accesible', 'summary' => 'Tablero, tarjetas y reglas para reflexionar en grupo sobre barreras y derechos.', 'kind' => 'fisico', 'format' => 'Juego imprimible', 'duration' => '40 min', 'audience' => 'Grupos y aula',
                    'pages' => self::premium('Sensibilizar sobre accesibilidad jugando.', ['Imprime en A3 el tablero.', 'Cierra con el debate guiado.'])],
                ['title' => 'Kit de dinamización de asambleas', 'summary' => 'Roles, turnos de palabra, actas sencillas y técnicas para que todas las voces cuenten.', 'kind' => 'digital', 'format' => 'Kit digital', 'audience' => 'Participación comunitaria',
                    'pages' => self::premium('Asambleas más participativas y eficaces.', ['Reparte las tarjetas de rol.', 'Usa el temporizador de turnos.'])],
            ],

            'mediacion' => [
                [
                    'title' => 'Protocolo de mediación en 6 fases',
                    'summary' => 'Guía de bolsillo para conducir una mediación: de la premediación al acuerdo y su seguimiento.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Guía · 2 págs.', 'duration' => 'Referencia', 'audience' => 'Mediación comunitaria y escolar',
                    'pages' => [
                        ['Las seis fases', "## 1. Premediación\nEntrevistas por separado. ¿Es mediable? ¿Hay voluntariedad?\n\n## 2. Presentación y reglas\nConfidencialidad, respeto de turnos, neutralidad de quien media.\n\n## 3. Cuéntame\nCada parte relata su versión. Escucha activa y parafraseo.\n\n## 4. Aclarar el problema\nDe posiciones a intereses: ¿qué necesita cada parte?\n\n## 5. Proponer soluciones\nLluvia de ideas sin juzgar; después, valorar viabilidad.\n\n## 6. Llegar a un acuerdo\nConcreto, equilibrado, por escrito y con fecha de revisión."],
                        ['Frases que ayudan', "## Para parafrasear\n- «Si te he entendido bien, lo que te molesta es…»\n- «Para ti es importante que…»\n\n## Para pasar a intereses\n- «¿Qué necesitarías para sentirte tranquilo?»\n- «¿Qué pasaría si no llegáis a un acuerdo?»\n\n## Para reconducir\n- «Volvamos a lo que podemos cambiar a partir de hoy.»\n\n> Quien media no decide: facilita que las partes decidan."],
                    ],
                ],
                [
                    'title' => 'Transformador de mensajes: del «tú» al «yo»',
                    'summary' => 'Convierte un reproche en un mensaje asertivo paso a paso: situación, emoción, motivo y petición.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'mensajes-yo', 'format' => 'Herramienta web', 'duration' => '10 min', 'audience' => 'Habilidades sociales',
                ],
                ['title' => 'Casos prácticos de mediación vecinal', 'summary' => 'Diez casos reales anonimizados con propuesta de resolución comentada.', 'kind' => 'fisico', 'format' => 'Cuaderno · 10 casos', 'audience' => 'Formación',
                    'pages' => self::premium('Entrenar el análisis de conflictos.', ['Trabaja cada caso por fases.', 'Compara tu propuesta con la comentada.'])],
                ['title' => 'Cartas de emociones para la resolución de conflictos', 'summary' => 'Baraja de 48 cartas ilustradas para nombrar emociones y necesidades.', 'kind' => 'fisico', 'format' => 'Baraja imprimible', 'audience' => 'Infancia, adolescencia y adultos',
                    'pages' => self::premium('Poner nombre a lo que se siente.', ['Imprime en cartulina.', 'Usa las tres dinámicas propuestas.'])],
                ['title' => 'Acta de acuerdo de mediación', 'summary' => 'Plantilla editable de acta con cláusulas de seguimiento y revisión.', 'kind' => 'fisico', 'format' => 'Plantilla editable', 'audience' => 'Profesionales',
                    'pages' => self::premium('Formalizar acuerdos claros.', ['Rellena con las partes presentes.', 'Fija la fecha de revisión.'])],
                ['title' => 'Simulador de escucha activa', 'summary' => 'Escucha fragmentos de conversación y elige la mejor respuesta empática.', 'kind' => 'digital', 'format' => 'Simulación', 'duration' => '15 min', 'audience' => 'Formación individual',
                    'pages' => self::premium('Mejorar la escucha activa.', ['Completa los tres niveles.', 'Revisa el informe final.'])],
            ],

            'apoyo-idiomatico' => [
                [
                    'title' => 'Glosario visual de servicios básicos',
                    'summary' => 'Vocabulario esencial para la acogida en cuatro idiomas: salud, vivienda, trámites y educación.',
                    'kind' => 'fisico', 'access' => 'demo', 'format' => 'Glosario · 2 págs.', 'duration' => 'Referencia', 'audience' => 'Acogida de personas migrantes',
                    'pages' => [
                        ['Salud y urgencias', "## Castellano · English · Français · العربية\n- Centro de salud · Health centre · Centre de santé · مركز صحي\n- Médico / médica · Doctor · Médecin · طبيب\n- Me duele aquí · It hurts here · J'ai mal ici · يؤلمني هنا\n- Urgencias · Emergency · Urgences · الطوارئ\n- Farmacia · Pharmacy · Pharmacie · صيدلية\n- Tarjeta sanitaria · Health card · Carte de santé · بطاقة صحية\n\n> Señala la palabra y pide a la persona que la repita en voz alta."],
                        ['Trámites y vivienda', "## Castellano · English · Français · العربية\n- Empadronamiento · Registration · Inscription · التسجيل في البلدية\n- Cita previa · Appointment · Rendez-vous · موعد\n- Pasaporte · Passport · Passeport · جواز السفر\n- Alquiler · Rent · Loyer · إيجار\n- Contrato · Contract · Contrat · عقد\n- Firma aquí · Sign here · Signez ici · وقّع هنا\n\n## Palabras que quiero aprender\n___\n___"],
                    ],
                ],
                [
                    'title' => 'Tarjetas de comunicación multilingüe con audio',
                    'summary' => 'Frases de acogida en varios idiomas con pronunciación en voz alta, para entenderse desde el primer día.',
                    'kind' => 'digital', 'access' => 'demo', 'interactive' => 'frases', 'format' => 'Herramienta web', 'duration' => 'Uso libre', 'audience' => 'Acogida y atención directa',
                ],
                ['title' => 'Kit de acogida en 6 idiomas', 'summary' => 'Carteles, hoja de bienvenida y normas del centro traducidas y maquetadas.', 'kind' => 'fisico', 'format' => 'Kit imprimible', 'audience' => 'Centros y servicios',
                    'pages' => self::premium('Recibir con claridad y calidez.', ['Imprime los carteles de señalización.', 'Entrega la hoja de bienvenida en el idioma de la persona.'])],
                ['title' => 'Pictogramas para trámites administrativos', 'summary' => 'Secuencias con pictogramas para empadronamiento, cita médica, matrícula escolar y otros trámites.', 'kind' => 'fisico', 'format' => '8 secuencias', 'audience' => 'Acompañamiento a trámites',
                    'pages' => self::premium('Hacer comprensibles los trámites.', ['Repasa la secuencia antes de la cita.', 'Lleva la lámina al trámite.'])],
                ['title' => 'Guía de comunicación intercultural', 'summary' => 'Claves para trabajar con intérpretes, mediadores culturales y evitar malentendidos frecuentes.', 'kind' => 'fisico', 'format' => 'Guía PDF · 12 págs.', 'audience' => 'Profesionales',
                    'pages' => self::premium('Comunicar mejor entre culturas.', ['Lee el decálogo antes de la entrevista.', 'Usa la lista de comprobación con intérpretes.'])],
                ['title' => 'Español para la vida diaria (A1–A2)', 'summary' => 'Actividades interactivas por situaciones: el médico, la compra, el transporte, el colegio.', 'kind' => 'digital', 'format' => 'Actividades web', 'duration' => '20 min por unidad', 'audience' => 'Personas adultas',
                    'pages' => self::premium('Aprender español útil desde el primer día.', ['Elige la situación.', 'Practica con audio y repite.'])],
            ],
        ];
    }
}
