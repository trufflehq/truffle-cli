import chalk from 'chalk';
import { packageVersionGet } from '../util/package-version.js';
function helpInfo() {
    console.log('`truffle-cli describe` options:');
    console.log(`\t\tsubscriptions: fetches the package version's event subscriptions`);
    console.log(`\t\ttopics: fetches the package version's event topics`);
    console.log(`\t\tpackage: fetches the package version's package`);
    console.log(`\t\tdefault: fetches the package version's package, topics, and subscriptions`);
    console.log(`\t\t-h: fetches the package version's event topics`);
}
function printPackageVersionHeader(packageVersion) {
    console.log(chalk.bold(`Package Version (${packageVersion.package.slug}@${packageVersion.semver})`));
    console.log(`id: ${packageVersion.id}`);
    console.log(`org: ${packageVersion.package.org.slug}`);
}
function printPackageVersionEventSubscriptions(packageVersionWithSub) {
    const eventSubscriptionConnection = packageVersionWithSub?.eventSubscriptionConnection;
    console.log(chalk.bold(`Event Subscriptions:`));
    console.log(JSON.stringify(eventSubscriptionConnection.nodes, null, 2));
}
function printPackageVersionEventTopics(packageVersionWithTopics) {
    const eventTopicConnection = packageVersionWithTopics?.eventTopicConnection;
    console.log(chalk.bold(`Event Topics:`));
    console.log(JSON.stringify(eventTopicConnection.nodes, null, 2));
}
function printPackageVersionPackage(packageVersionWithPkg) {
    console.log(chalk.bold(`Package:`));
    console.log(`id: ${packageVersionWithPkg.package.id}`);
    console.log(`name: ${packageVersionWithPkg.package.name}`);
}
export default async function describe({ model }) {
    switch (model) {
        case 'subscriptions': {
            // list out event subscriptions
            const packageVersionWithSub = await packageVersionGet({ includeEventSubscriptions: true });
            printPackageVersionHeader(packageVersionWithSub);
            printPackageVersionEventSubscriptions(packageVersionWithSub);
            break;
        }
        case 'topics': {
            // list out event topic
            const packageVersionWithTopics = await packageVersionGet({ includeEventTopics: true });
            printPackageVersionHeader(packageVersionWithTopics);
            printPackageVersionEventTopics(packageVersionWithTopics);
            break;
        }
        case 'package': {
            // describe info about the package version's package
            const packageVersionWithPkg = await packageVersionGet();
            printPackageVersionHeader(packageVersionWithPkg);
            printPackageVersionPackage(packageVersionWithPkg);
            break;
        }
        case '-h': {
            helpInfo();
            break;
        }
        default: {
            const packageVersionAll = await packageVersionGet({ includeEventSubscriptions: true, includeEventTopics: true });
            printPackageVersionHeader(packageVersionAll);
            printPackageVersionPackage(packageVersionAll);
            printPackageVersionEventTopics(packageVersionAll);
            printPackageVersionEventSubscriptions(packageVersionAll);
            break;
        }
    }
}
//# sourceMappingURL=describe.js.map