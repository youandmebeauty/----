import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
    title: "Mentions Légales - You & Me Beauty",
    description: "Conditions d'échange et retour, politique de confidentialité et conditions d'utilisation de You & Me Beauty.",
}

export default function LegalPage() {
    return (
        <main className="min-h-screen bg-background py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
                    <ArrowLeft className="h-4 w-4" />
                    Retour à l'accueil
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Mentions Légales</h1>
                    <p className="text-muted-foreground text-lg">You & Me Beauty - Politique et conditions</p>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-wrap gap-3 mb-12">
                    <a href="#conditions-retour" className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors">
                        Conditions d'Échange & Retour
                    </a>
                    <a href="#privacy" className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors">
                        Politique de Confidentialité
                    </a>
                    <a href="#terms" className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-full text-primary transition-colors">
                        Conditions d'Utilisation
                    </a>
                </div>

                {/* Content */}
                <div className="space-y-16">
                    {/* Section 1: Conditions d'Échange et Retour */}
                    <section id="conditions-retour" className="border-b border-border pb-12">
                        <h2 className="text-3xl font-bold mb-6">Conditions d'Échange et Retour</h2>
                        
                        <div className="space-y-6 text-foreground/90">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Politique de Non-Retour</h3>
                                <p className="leading-relaxed">
                                    Veuillez noter que You & Me Beauty n'accepte ni les échanges ni les retours de produits cosmétiques. 
                                    Cette politique est en place pour des raisons sanitaires et de sécurité, conformément aux normes 
                                    d'hygiène et de protection des consommateurs applicables aux produits cosmétiques.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Produits Défectueux ou Endommagés</h3>
                                <p className="leading-relaxed">
                                    Si vous recevez un produit défectueux, endommagé ou qui ne correspond pas à votre commande, 
                                    veuillez nous contacter dans les 48 heures suivant la réception. Nous examinerons votre demande 
                                    et vous proposerons une solution appropriée (remplacement ou remboursement) selon les circonstances.
                                </p>
                                <p className="leading-relaxed mt-3">
                                    Pour signaler un problème : <a href="mailto:youandme282@gmail.com" className="text-primary hover:underline">youandme282@gmail.com</a> ou 
                                    <a href="tel:+21693220902" className="text-primary hover:underline ml-1">+216 93 220 902</a>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Conditions Essentielles</h3>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Les produits doivent être dans leur emballage d'origine et non ouverts</li>
                                    <li>Aucun remboursement ne sera accordé pour les produits ouverts ou utilisés</li>
                                    <li>Les délais de rétractation conformément à la loi s'appliquent lors de votre achat initial</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Droit de Rétractation</h3>
                                <p className="leading-relaxed">
                                    Conformément à la loi tunisienne sur le commerce électronique, vous disposez d'un délai de 14 jours 
                                    à compter de la date de réception de votre commande pour exercer votre droit de rétractation. 
                                    Cependant, pour les produits cosmétiques en particulier, le droit de rétractation ne s'applique que 
                                    si l'emballage n'a pas été ouvert et que le produit n'a pas été utilisé.
                                </p>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="text-sm font-medium text-foreground">
                                    Pour toute question concernant cette politique, n'hésitez pas à nous contacter.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Politique de Confidentialité */}
                    <section id="privacy" className="border-b border-border pb-12">
                        <h2 className="text-3xl font-bold mb-6">Politique de Confidentialité</h2>
                        
                        <div className="space-y-6 text-foreground/90">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Introduction</h3>
                                <p className="leading-relaxed">
                                    You & Me Beauty respecte votre vie privée et s'engage à protéger vos données personnelles. 
                                    Nous avons conçu notre site pour minimiser la collecte de données. Cette politique de confidentialité 
                                    explique comment nous collectons, utilisons et protégeons vos informations.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Données Collectées</h3>
                                <p className="leading-relaxed mb-3">We collect the following information :</p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li><strong>Informations de commande :</strong> Nom, adresse, e-mail, numéro de téléphone (collectées uniquement lors de la création d'une commande)</li>
                                    <li><strong>Panier :</strong> Stocké localement dans votre navigateur (localStorage), jamais envoyé au serveur jusqu'à la commande</li>
                                    <li><strong>Stockage local (localStorage) :</strong> Utilisé pour stocker le panier, l'historique des analyses de peau et les préférences du site</li>
                                    <li><strong>Données de l'analyse de peau :</strong> Voir la section dédiée ci-dessous</li>
                                </ul>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="text-lg font-semibold mb-3 text-foreground">Skin Analyzer - Traitement d'Images et Photographies</h4>
                                <div className="space-y-3 text-sm">
                                    <p className="leading-relaxed">
                                        Notre outil <strong>Skin Analyzer</strong> utilise une technologie d'intelligence artificielle qui fonctionne entièrement 
                                        <strong> côté client</strong> (dans votre navigateur).
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-2">
                                        <li>Les photos que vous prenez <strong>ne sont jamais envoyées vers nos serveurs</strong></li>
                                        <li>L'analyse se fait uniquement sur votre appareil</li>
                                        <li>Les images ne sont pas stockées sur nos systèmes</li>
                                        <li>Aucune donnée biométrique n'est conservée</li>
                                        <li>Vous avez le contrôle total sur vos photos et pouvez les supprimer à tout moment</li>
                                    </ul>
                                    <p className="leading-relaxed mt-3">
                                        Cette approche respecte votre vie privée en garantissant que vos informations sensibles restent 
                                        exclusivement sur votre appareil.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Utilisation des Données</h3>
                                <p className="leading-relaxed mb-3">Nous utilisons vos données pour :</p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Traiter et livrer vos commandes</li>
                                    <li>Vous contacter concernant votre achat ou nos services</li>
                                    <li>Améliorer notre site et nos services</li>
                                </ul>
                                <p className="leading-relaxed mt-3 text-sm italic">
                                    <strong>Important :</strong> Nous n'utilisons pas vos données pour du marketing ou des communications promotionnelles 
                                    sans votre consentement explicite.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Sécurité des Données</h3>
                                <p className="leading-relaxed">
                                    Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre 
                                    l'accès non autorisé, la modification ou la divulgation. Cependant, aucune transmission sur internet 
                                    n'est 100% sécurisée.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Création de Compte</h3>
                                <p className="leading-relaxed">
                                    <strong>You & Me Beauty ne requiert pas la création de compte client.</strong> Vous pouvez :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                                    <li>Consulter librement tous nos produits et collections</li>
                                    <li>Utiliser l'analyseur de peau sans inscription</li>
                                    <li>Effectuer vos achats sans créer de profil utilisateur</li>
                                    <li>Accéder à votre facture directement depuis votre navigateur</li>
                                </ul>
                                <p className="leading-relaxed mt-3">
                                    Les seules données conservées sont celles nécessaires pour traiter votre commande et vous permettre de télécharger votre facture.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Stockage Local (localStorage)</h3>
                                <p className="leading-relaxed mb-3">
                                    Votre navigateur stocke localement certaines données pour votre commodité :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li><strong>Panier d'achat :</strong> Conservé localement en cas de fermeture du navigateur</li>
                                    <li><strong>Analyse de peau :</strong> Un identifiant de dispositif pour le suivi des analyses historiques</li>
                                    <li><strong>Préférences du site :</strong> Thème, langue et paramètres d'interface</li>
                                </ul>
                                <p className="leading-relaxed mt-3 text-sm">
                                    Ces données résident uniquement sur votre appareil et ne sont jamais transmises à nos serveurs, 
                                    sauf si vous effectuez une commande. Vous pouvez les effacer en vidant les données locales de votre navigateur.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Pas de Cookies de Suivi</h3>
                                <p className="leading-relaxed">
                                    <strong>You & Me Beauty n'utilise pas de cookies de suivi ou d'analyse.</strong> Notre site fonctionne 
                                    sans cookies, ce qui signifie que nous ne vous suivons pas à travers le web. Les seules données stockées 
                                    sont vos préférences locales dans votre navigateur (localStorage), uniquement pour améliorer votre expérience.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">Droits de l'Utilisateur</h3>
                                <p className="leading-relaxed mb-3">Vous avez le droit de :</p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Accéder à vos données personnelles</li>
                                    <li>Demander la correction de données inexactes</li>
                                    <li>Supprimer vos données locales (localStorage) via votre navigateur</li>
                                    <li>Retirer votre consentement à tout moment</li>
                                </ul>
                                <p className="leading-relaxed mt-3">
                                    Pour exercer ces droits concernant vos données de commande, contactez-nous à :
                                    <a href="mailto:youandme282@gmail.com" className="text-primary hover:underline ml-1">youandme282@gmail.com</a>
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* Section 3: Conditions d'Utilisation */}
                    <section id="terms" className="pb-12">
                        <h2 className="text-3xl font-bold mb-6">Conditions d'Utilisation</h2>
                        
                        <div className="space-y-6 text-foreground/90">
                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">1. Acceptation des Conditions</h3>
                                <p className="leading-relaxed">
                                    En accédant et en utilisant le site You & Me Beauty, vous acceptez de vous conformer à ces 
                                    conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">2. Utilisation Légitime du Site</h3>
                                <p className="leading-relaxed mb-3">Vous vous engagez à utiliser ce site de manière responsable et légale. Il est interdit de :</p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Violer les lois applicables</li>
                                    <li>Utiliser le site à des fins de fraude ou d'arnaque</li>
                                    <li>Accéder ou tenter d'accéder à des systèmes sécurisés sans autorisation</li>
                                    <li>Télécharger ou transmettre des virus ou codes malveillants</li>
                                    <li>Harceler, abuser ou menacer d'autres utilisateurs</li>
                                    <li>Utiliser le site pour du spam ou du contenu offensant</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">3. Propriété Intellectuelle</h3>
                                <p className="leading-relaxed">
                                    Tout le contenu du site (textes, images, logo, design) est la propriété de You & Me Beauty ou 
                                    de ses fournisseurs de contenu. Vous ne pouvez pas reproduire, modifier ou distribuer ce contenu 
                                    sans permission.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">4. Commandes et Paiements</h3>
                                <p className="leading-relaxed mb-3">
                                    Les prix affichés peuvent être modifiés sans préavis. You & Me Beauty se réserve le droit de 
                                    refuser ou d'annuler toute commande pour les raisons suivantes :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Données de commande incorrectes ou incomplètes</li>
                                    <li>Activité frauduleuse détectée</li>
                                    <li>Problèmes de disponibilité des produits</li>
                                    <li>Restriction légale ou de réglementaire</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">5. Responsabilité Limitée</h3>
                                <p className="leading-relaxed mb-3">
                                    You & Me Beauty ne peut être tenue responsable de :
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-2">
                                    <li>Les dommages indirects ou accessoires résultant de l'utilisation du site</li>
                                    <li>Les pertes de données ou d'opportunités</li>
                                    <li>Les interruptions ou indisponibilités du service</li>
                                    <li>Les erreurs ou omissions dans le contenu du site</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">6. Exonération de Responsabilité - Skin Analyzer</h3>
                                <p className="leading-relaxed">
                                    L'outil Skin Analyzer est fourni à titre informatif uniquement et ne remplace pas un avis dermatologique 
                                    professionnel. You & Me Beauty ne peut pas être tenue responsable des décisions prises en fonction 
                                    des résultats fournis par cet outil. Consultez un dermatologue pour un diagnostic professionnel.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">7. Liens Externes</h3>
                                <p className="leading-relaxed">
                                    Notre site peut contenir des liens vers des sites externes. You & Me Beauty n'est pas responsable 
                                    du contenu ou des pratiques de ces sites externes.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">8. Modifications des Conditions</h3>
                                <p className="leading-relaxed">
                                    You & Me Beauty se réserve le droit de modifier ces conditions d'utilisation à tout moment. 
                                    Les modifications prennent effet dès qu'elles sont publiées sur le site. Nous vous encourageons 
                                    à consulter régulièrement cette page.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">9. Droit Applicable</h3>
                                <p className="leading-relaxed">
                                    Ces conditions d'utilisation sont régies par les lois de la Tunisie. Tout litige sera soumis 
                                    aux tribunaux compétents.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold mb-3 text-foreground">10. Contact</h3>
                                <p className="leading-relaxed">
                                    Pour toute question concernant ces conditions, veuillez nous contacter :
                                </p>
                                <div className="mt-3 ml-2">
                                    <p className="mb-2"><strong>Email :</strong> <a href="mailto:youandme282@gmail.com" className="text-primary hover:underline">youandme282@gmail.com</a></p>
                                    <p><strong>Téléphone :</strong> <a href="tel:+21693220902" className="text-primary hover:underline">+216 93 220 902</a></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Last Updated */}
                    <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                        <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            </div>
        </main>
    )
}
