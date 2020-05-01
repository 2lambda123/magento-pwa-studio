import Article from "../../components/Article"
import Section from "../../components/Section"
import TableOfContents from "../../components/TableOfContents"
import Options from "./sections/Options"
import Structure from "./sections/Structure"

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
quis euismod nisi. Morbi metus mauris, volutpat ac aliquet eget,
laoreet vel tortor. Pellentesque commodo tellus nibh, vitae
varius lectus pharetra in. Aliquam quis nisi ligula. Proin sit
amet mauris ac lacus efficitur varius eget in urna. Ut sagittis
feugiat ex et dictum. Nam ut tempor urna, at dapibus erat.
Aenean ac dui a tellus venenatis accumsan.

***

<Section title="Table of contents">
    <TableOfContents />
</Section>
<Section title="Options">
  <Options />
</Section>
<Section title="Structure">
  <Structure />
</Section>

export const title = "Text input"
export default Article
